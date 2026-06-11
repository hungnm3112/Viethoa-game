import fs from "node:fs";
import path from "node:path";
import { extractXmlStrings, normalizeText, placeholdersMatch, replaceXmlStrings } from "./lib/strings.js";
import {
  appendEvent,
  backupFile,
  createSession,
  loadSession,
  restoreBackup,
  saveSession,
  updateDashboard,
} from "./lib/translation-monitor.js";
import { readProfiles, resolveProfileMatchers } from "./lib/job-planner.js";
import { loadTranslationCache, persistTranslationEntries, readStateJson, writeStateJson } from "./lib/state-repository.js";
import { closeMongoClient } from "./lib/mongo-store.js";

const args = parseArgs(process.argv.slice(2));
if (!args.group && process.argv[2] && !process.argv[2].startsWith("--")) {
  args.group = process.argv[2];
}
if (!args.limit && process.argv[3] && !process.argv[3].startsWith("--")) {
  args.limit = process.argv[3];
}
const limit = Number(args.limit ?? 5);
const group = args.group ? String(args.group) : null;
const profileMatchers = resolveProfileMatchers(args.profile, readProfiles("config/translation-phases.json"));
const directMatchers = String(args.match ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const matchers = [...profileMatchers, ...directMatchers];
const cacheFile = "cache/translations.json";
const fallbackModels = buildModelList();
const apiKey = process.env.GEMINI_API_KEY;
const maxAttempts = Number(args["max-attempts"] ?? 3);
const scope = args.profile ? `profile:${args.profile}` : group ? `group:${group}` : matchers.length > 0 ? matchers.join(",") : "all";

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY. Copy .env.example to .env, then load it before running.");
}

let pending = await readStateJson("jobs.pending", "jobs/pending.json", []);
let done = await readStateJson("jobs.done", "jobs/done.json", []);
let failed = await readStateJson("jobs.failed", "jobs/failed.json", []);
const cache = new Map(Object.entries(await loadTranslationCache(cacheFile)));
let processed = 0;
const session = await createOrResumeSession();

await appendEvent("translate-start", {
  sessionId: session.id,
  scope,
  limit,
  pendingJobs: pending.length,
});
await updateDashboard({ session, scope, notes: session.notes });

for (const job of [...pending]) {
  if (processed >= limit) break;
  if (group && job.group !== group) continue;
  if (matchers.length > 0 && !matchers.some((matcher) => job.inputFile.includes(matcher))) continue;

  try {
    const missing = job.strings.filter((text) => !cache.has(text));
    let translatedNow = 0;
    let reusedCached = 0;

    if (missing.length > 0) {
      const batchResult = await translateBatch(missing, session);
      const translated = batchResult.translations;
      if (batchResult.diagnostics.unmatchedKeys.length > 0 || batchResult.diagnostics.matchedNormalized > 0) {
        await appendEvent("translation-key-diagnostics", {
          sessionId: session.id,
          jobId: job.id,
          inputFile: job.inputFile,
          returnedKeyCount: batchResult.diagnostics.returnedKeyCount,
          matchedById: batchResult.diagnostics.matchedById,
          matchedExact: batchResult.diagnostics.matchedExact,
          matchedNormalized: batchResult.diagnostics.matchedNormalized,
          unmatchedKeys: batchResult.diagnostics.unmatchedKeys.slice(0, 5),
        });
      }
      const updatedEntries = {};
      const rejectedStrings = [];
      for (const [source, value] of Object.entries(translated)) {
        if (!missing.includes(source)) continue;
        const safeValue = await repairPlaceholderMismatch(source, value, session);
        if (!safeValue) {
          rejectedStrings.push(source);
          continue;
        }
        cache.set(source, safeValue);
        updatedEntries[source] = safeValue;
        translatedNow += 1;
      }
      if (rejectedStrings.length > 0) {
        await appendEvent("string-skipped-placeholder", {
          sessionId: session.id,
          jobId: job.id,
          inputFile: job.inputFile,
          count: rejectedStrings.length,
          samples: rejectedStrings.slice(0, 5),
        });
        console.warn(
          `Skipped ${rejectedStrings.length} string(s) with unresolved placeholders in job ${job.id}: ${rejectedStrings.slice(0, 2).join(" | ")}`,
        );
      }
      if (missing.length > 0 && translatedNow === 0) {
        await appendEvent("job-no-valid-translation", {
          sessionId: session.id,
          jobId: job.id,
          inputFile: job.inputFile,
          missingCount: missing.length,
          parsedTranslationCount: Object.keys(translated).length,
          placeholderRejectedCount: rejectedStrings.length,
          unmatchedKeyCount: batchResult.diagnostics.unmatchedKeys.length,
          missingSamples: missing.slice(0, 5),
          unmatchedKeySamples: batchResult.diagnostics.unmatchedKeys.slice(0, 5),
        });
        throw new Error(
          `No valid translation for job ${job.id}: missing=${missing.length}, parsed=${Object.keys(translated).length}, placeholderRejected=${rejectedStrings.length}, unmatchedKeys=${batchResult.diagnostics.unmatchedKeys.length}`,
        );
      }
      await persistTranslationEntries(cacheFile, Object.fromEntries(cache), updatedEntries);
    }
    reusedCached = job.strings.length - missing.length;

    await writeOutput(job, cache, session);
    pending = pending.filter((item) => item.id !== job.id);
    done.push({ ...job, doneAt: new Date().toISOString() });
    await writeStateJson("jobs.pending", "jobs/pending.json", pending);
    await writeStateJson("jobs.done", "jobs/done.json", done);

    processed += 1;
    session.processedJobs += 1;
    session.successfulJobs += 1;
    session.translatedStrings += translatedNow;
    session.reusedCachedStrings += reusedCached;
    session.lastError = null;
    session.notes = [`Lan thanh cong gan nhat: ${job.inputFile}`];
    await saveSession(session);
    await appendEvent("job-done", {
      sessionId: session.id,
      jobId: job.id,
      inputFile: job.inputFile,
      translatedNow,
      reusedCached,
    });
    await updateDashboard({ session, scope, notes: session.notes });
    console.log(`Done job ${job.id} (${job.group}) ${job.inputFile}`);
  } catch (error) {
    const attempts = Number(job.attempts ?? 0) + 1;
    const failedRecord = { ...job, attempts, error: error.message, failedAt: new Date().toISOString() };
    pending = pending.filter((item) => item.id !== job.id);

    if (attempts >= maxAttempts) {
      failed.push(failedRecord);
      await appendEvent("job-failed-final", {
        sessionId: session.id,
        jobId: job.id,
        inputFile: job.inputFile,
        attempts,
        error: error.message,
      });
    } else {
      pending.push({ ...job, attempts });
      await appendEvent("job-failed-requeue", {
        sessionId: session.id,
        jobId: job.id,
        inputFile: job.inputFile,
        attempts,
        error: error.message,
      });
    }

    await writeStateJson("jobs.pending", "jobs/pending.json", pending);
    await writeStateJson("jobs.failed", "jobs/failed.json", failed);
    session.processedJobs += 1;
    session.failedJobs += 1;
    session.lastError = error.message;
    session.notes = [`Lan loi gan nhat: ${job.inputFile}`];
    await saveSession(session);
    await updateDashboard({ session, scope, notes: session.notes });
    console.error(`Failed job ${job.id}: ${error.message}`);
    if (String(args["stop-on-error"] ?? "false") === "true") break;
  }
}

session.status = pending.length === 0 ? "completed" : "paused";
if (pending.length === 0) {
  session.completedAt = new Date().toISOString();
}
await saveSession(session);
await appendEvent("translate-stop", {
  sessionId: session.id,
  status: session.status,
  processed,
  pendingJobs: pending.length,
});
await updateDashboard({ session, scope, notes: session.notes });
console.log(`Processed ${processed} job(s). Pending: ${pending.length}`);
await closeMongoClient();

async function translateBatch(strings, activeSession) {
  const items = strings.map((text, index) => ({
    id: `s${index + 1}`,
    text,
  }));
  const prompt = [
    "Translate these State of Decay game UI/dialog strings from English to Vietnamese.",
    "Input is an array of objects with id and text.",
    "Return only a valid JSON object where each id is the key and its Vietnamese translation is the value.",
    "Example response shape: {\"s1\":\"Ban dich tieng Viet\", \"s2\":\"Ban dich khac\"}.",
    "Do not use the original English text as JSON keys.",
    "Keep all placeholders exactly unchanged: {0}, {1}, %s, %d, %1$s, \\n, ##, XML-like tags, bracket codes.",
    "Use natural Vietnamese with proper diacritics suitable for a zombie survival game.",
    "",
    JSON.stringify(items, null, 2),
  ].join("\n");

  let lastError = null;
  for (const model of fallbackModels) {
    try {
      activeSession.activeModel = model;
      await saveSession(activeSession);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        const body = await response.text();
        if (shouldFallback(response.status)) {
          lastError = new Error(`Gemini HTTP ${response.status} on ${model}: ${body}`);
          activeSession.fallbackCount += 1;
          await saveSession(activeSession);
          await appendEvent("model-fallback", {
            sessionId: activeSession.id,
            model,
            reason: `HTTP ${response.status}`,
          });
          console.warn(`Model ${model} failed with ${response.status}. Trying fallback...`);
          await delay(1500);
          continue;
        }
        throw new Error(`Gemini HTTP ${response.status} on ${model}: ${body}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") ?? "";
      return normalizeTranslationBatch(JSON.parse(cleanJson(text)), strings);
    } catch (error) {
      lastError = error;
      if (!shouldFallback(error?.message)) throw error;
      activeSession.fallbackCount += 1;
      await saveSession(activeSession);
      await appendEvent("model-fallback", {
        sessionId: activeSession.id,
        model,
        reason: error?.message ?? "unknown",
      });
      console.warn(`Model ${model} errored. Trying fallback...`);
      await delay(1500);
    }
  }

  throw lastError ?? new Error("No Gemini model succeeded");
}

function normalizeTranslationBatch(parsed, strings) {
  const sourceById = new Map(strings.map((text, index) => [`s${index + 1}`, text]));
  const exactSources = new Set(strings);
  const normalizedSources = buildUniqueNormalizedSourceMap(strings);
  const payload = unwrapTranslationPayload(parsed);
  const translations = {};
  const diagnostics = {
    returnedKeyCount: 0,
    matchedById: 0,
    matchedExact: 0,
    matchedNormalized: 0,
    unmatchedKeys: [],
  };

  for (const [rawKey, rawValue] of translationPayloadEntries(payload)) {
    diagnostics.returnedKeyCount += 1;
    if (typeof rawValue !== "string") {
      diagnostics.unmatchedKeys.push(String(rawKey));
      continue;
    }

    const key = String(rawKey);
    const source = resolveReturnedTranslationKey(key, sourceById, exactSources, normalizedSources, diagnostics);
    if (!source) {
      diagnostics.unmatchedKeys.push(key);
      continue;
    }
    translations[source] = rawValue;
  }

  return { translations, diagnostics };
}

function unwrapTranslationPayload(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return parsed;
  }
  for (const key of ["translations", "result", "items"]) {
    if (parsed[key] && typeof parsed[key] === "object") {
      return parsed[key];
    }
  }
  return parsed;
}

function translationPayloadEntries(payload) {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const key = item.id ?? item.key ?? item.source ?? item.text;
        const value = item.translation ?? item.value ?? item.vi ?? item.vietnamese;
        return key !== undefined ? [key, value] : null;
      })
      .filter(Boolean);
  }
  if (payload && typeof payload === "object") {
    return Object.entries(payload);
  }
  return [];
}

function resolveReturnedTranslationKey(key, sourceById, exactSources, normalizedSources, diagnostics) {
  if (sourceById.has(key)) {
    diagnostics.matchedById += 1;
    return sourceById.get(key);
  }
  if (exactSources.has(key)) {
    diagnostics.matchedExact += 1;
    return key;
  }
  const normalizedSource = normalizedSources.get(normalizeText(key));
  if (normalizedSource) {
    diagnostics.matchedNormalized += 1;
    return normalizedSource;
  }
  return null;
}

function buildUniqueNormalizedSourceMap(strings) {
  const counts = new Map();
  for (const source of strings) {
    const normalized = normalizeText(source);
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  return new Map(strings.map((source) => [normalizeText(source), source]).filter(([normalized]) => counts.get(normalized) === 1));
}

async function writeOutput(job, cacheMap, activeSession) {
  const xml = fs.readFileSync(job.inputFile, "utf8");
  const translations = new Map(
    extractXmlStrings(xml)
      .map((item) => item.value)
      .map((text) => [text, cacheMap.get(text)])
      .filter(([, value]) => value),
  );
  const output = replaceXmlStrings(xml, translations);
  fs.mkdirSync(path.dirname(job.outputFile), { recursive: true });
  const backupPath = backupFile(job.outputFile);
  try {
    fs.writeFileSync(job.outputFile, output, "utf8");
  } catch (error) {
    const restored = restoreBackup(job.outputFile, backupPath);
    if (restored) {
      activeSession.rollbackCount += 1;
      await saveSession(activeSession);
      await appendEvent("rollback-applied", {
        sessionId: activeSession.id,
        outputFile: job.outputFile,
        backupPath,
      });
    }
    throw error;
  }
}

function cleanJson(text) {
  return text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const [key, inlineValue] = arg.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      result[key] = inlineValue;
      continue;
    }
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      result[key] = true;
    } else {
      result[key] = next;
      index += 1;
    }
  }
  return result;
}

function buildModelList() {
  const configured = [process.env.GEMINI_MODEL, ...(process.env.GEMINI_MODELS ?? "").split(",")]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  if (configured.length === 0) {
    throw new Error(
      "Missing GEMINI_MODEL or GEMINI_MODELS. Configure the exact Gemini API model ids in .env before running translate.",
    );
  }

  return [...new Set(configured)];
}

function shouldFallback(value) {
  const text = typeof value === "number" ? String(value) : String(value ?? "");
  return [
    "404",
    "429",
    "500",
    "502",
    "503",
    "504",
    "overloaded",
    "quota",
    "rate limit",
    "unavailable",
    "not found",
    "model not found",
  ].some((token) => text.toLowerCase().includes(token));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function repairPlaceholderMismatch(source, translated, activeSession) {
  if (placeholdersMatch(source, translated)) {
    return translated;
  }

  const repaired = await requestPlaceholderSafeTranslation(source, translated, activeSession);
  if (repaired && placeholdersMatch(source, repaired)) {
    return repaired;
  }

  return null;
}

async function requestPlaceholderSafeTranslation(source, translated, activeSession) {
  const prompt = [
    "Repair this Vietnamese translation so every placeholder and markup token stays exactly unchanged.",
    "Return only one JSON object with keys source and translation.",
    "Do not translate or alter tokens like {0}, %1$s, %s, ##, \\n, <frantic laughter>, or bracket codes.",
    "",
    JSON.stringify({ source, translation: translated }, null, 2),
  ].join("\n");

  let lastError = null;
  for (const model of fallbackModels) {
    try {
      activeSession.activeModel = model;
      await saveSession(activeSession);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        const body = await response.text();
        if (shouldFallback(response.status)) {
          lastError = new Error(`Gemini HTTP ${response.status} on ${model}: ${body}`);
          activeSession.fallbackCount += 1;
          await saveSession(activeSession);
          await appendEvent("model-fallback", {
            sessionId: activeSession.id,
            model,
            reason: `HTTP ${response.status} during placeholder repair`,
          });
          await delay(1000);
          continue;
        }
        throw new Error(`Gemini HTTP ${response.status} on ${model}: ${body}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") ?? "";
      const parsed = JSON.parse(cleanJson(text));
      const repaired = typeof parsed?.translation === "string" ? parsed.translation : "";
      if (repaired) {
        return repaired;
      }
    } catch (error) {
      lastError = error;
      if (!shouldFallback(error?.message)) break;
      activeSession.fallbackCount += 1;
      await saveSession(activeSession);
      await appendEvent("model-fallback", {
        sessionId: activeSession.id,
        model,
        reason: error?.message ?? "placeholder-repair",
      });
      await delay(1000);
    }
  }

  if (lastError) {
    console.warn(`Placeholder repair failed: ${lastError.message}`);
  }
  return null;
}

async function createOrResumeSession() {
  const existing = await loadSession();
  const shouldResume = existing.status === "running" || existing.status === "queued" || existing.status === "paused";
  const session = shouldResume
    ? {
        ...existing,
        status: "running",
        updatedAt: new Date().toISOString(),
        completedAt: null,
        lastError: null,
      }
    : createSession({
        status: "running",
        scope,
      });

  await saveSession(session);
  return session;
}
