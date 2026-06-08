import fs from "node:fs";
import path from "node:path";
import { readJson, writeJson } from "./lib/json-store.js";
import { extractXmlStrings, placeholdersMatch, replaceXmlStrings } from "./lib/strings.js";

const args = parseArgs(process.argv.slice(2));
if (!args.group && process.argv[2] && !process.argv[2].startsWith("--")) {
  args.group = process.argv[2];
}
if (!args.limit && process.argv[3] && !process.argv[3].startsWith("--")) {
  args.limit = process.argv[3];
}
const limit = Number(args.limit ?? 5);
const group = args.group ? String(args.group) : null;
const cacheFile = "cache/translations.json";
const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY. Copy .env.example to .env, then load it before running.");
}

let pending = readJson("jobs/pending.json", []);
let done = readJson("jobs/done.json", []);
let failed = readJson("jobs/failed.json", []);
const cache = new Map(Object.entries(readJson(cacheFile, {})));
let processed = 0;

for (const job of [...pending]) {
  if (processed >= limit) break;
  if (group && job.group !== group) continue;

  try {
    const missing = job.strings.filter((text) => !cache.has(text));
    if (missing.length > 0) {
      const translated = await translateBatch(missing);
      for (const [source, value] of Object.entries(translated)) {
        if (!missing.includes(source)) continue;
        if (!placeholdersMatch(source, value)) {
          throw new Error(`Placeholder mismatch for: ${source}`);
        }
        cache.set(source, value);
      }
      writeJson(cacheFile, Object.fromEntries(cache));
    }

    writeOutput(job, cache);
    pending = pending.filter((item) => item.id !== job.id);
    done.push({ ...job, doneAt: new Date().toISOString() });
    writeJson("jobs/pending.json", pending);
    writeJson("jobs/done.json", done);
    processed += 1;
    console.log(`Done job ${job.id} (${job.group}) ${job.inputFile}`);
  } catch (error) {
    pending = pending.filter((item) => item.id !== job.id);
    failed.push({ ...job, error: error.message, failedAt: new Date().toISOString() });
    writeJson("jobs/pending.json", pending);
    writeJson("jobs/failed.json", failed);
    console.error(`Failed job ${job.id}: ${error.message}`);
    break;
  }
}

console.log(`Processed ${processed} job(s). Pending: ${pending.length}`);

async function translateBatch(strings) {
  const prompt = [
    "Translate these State of Decay game UI/dialog strings from English to Vietnamese.",
    "Return only a valid JSON object where each original string is a key and its Vietnamese translation is the value.",
    "Keep all placeholders exactly unchanged: {0}, {1}, %s, %d, \\n, XML-like tags, bracket codes.",
    "Use natural Vietnamese with proper diacritics suitable for a zombie survival game.",
    "",
    JSON.stringify(strings, null, 2),
  ].join("\n");

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
    throw new Error(`Gemini HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") ?? "";
  return JSON.parse(cleanJson(text));
}

function writeOutput(job, cache) {
  const xml = fs.readFileSync(job.inputFile, "utf8");
  const translations = new Map(
    extractXmlStrings(xml)
      .map((item) => item.value)
      .map((text) => [text, cache.get(text)])
      .filter(([, value]) => value),
  );
  const output = replaceXmlStrings(xml, translations);
  fs.mkdirSync(path.dirname(job.outputFile), { recursive: true });
  fs.writeFileSync(job.outputFile, output, "utf8");
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
