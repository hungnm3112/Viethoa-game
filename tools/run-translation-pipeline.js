import { spawnSync } from "node:child_process";
import { writeJson } from "./lib/json-store.js";
import { buildJobs, parsePlannerArgs, readProfiles, resolveProfileMatchers } from "./lib/job-planner.js";
import { appendEvent, createSession, saveSession, updateDashboard } from "./lib/translation-monitor.js";
import { readStateJson, writeStateJson } from "./lib/state-repository.js";
import { closeMongoClient } from "./lib/mongo-store.js";

const args = parsePlannerArgs(process.argv.slice(2));
const profiles = readProfiles("config/translation-phases.json");
const profile = String(args.profile ?? "all");
const profileMatchers = profile === "all" ? [] : resolveProfileMatchers(profile, profiles);
const explicitMatchers = String(args.match ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const matchers = [...profileMatchers, ...explicitMatchers];
const maxStrings = Number(args["max-strings"] ?? 40);
const batchLimit = Number(args.limit ?? 8);
const maxCycles = Number(args["max-cycles"] ?? 999);
const rebuild = String(args.rebuild ?? "true") === "true";
const scope = profile === "all" && matchers.length === 0 ? "all" : profile;

if (rebuild || (await readStateJson("jobs.pending", "jobs/pending.json", [])).length === 0) {
  const jobs = buildJobs({ maxStrings, matchers });
  writeJson("jobs/pending.json", jobs);
  writeJson("jobs/done.json", []);
  writeJson("jobs/failed.json", []);
  await writeStateJson("jobs.pending", "jobs/pending.json", jobs);
  await writeStateJson("jobs.done", "jobs/done.json", []);
  await writeStateJson("jobs.failed", "jobs/failed.json", []);

  const session = createSession({
    status: "queued",
    scope,
    notes: [`Queued ${jobs.length} job(s) for ${scope}`],
  });
  await saveSession(session);
  await appendEvent("pipeline-queued", { sessionId: session.id, scope, jobs: jobs.length });
  await updateDashboard({ session, scope, notes: session.notes });
  console.log(`Queued ${jobs.length} job(s) for ${scope}`);
}

let previousPending = -1;
let previousDone = -1;

for (let cycle = 1; cycle <= maxCycles; cycle += 1) {
  const pendingBefore = (await readStateJson("jobs.pending", "jobs/pending.json", [])).length;
  const doneBefore = (await readStateJson("jobs.done", "jobs/done.json", [])).length;
  if (pendingBefore === 0) {
    console.log("No pending jobs left.");
    break;
  }

  console.log(`Cycle ${cycle}: pending=${pendingBefore}, done=${doneBefore}`);
  const translateArgs = ["--env-file=.env", "tools/translate.js", `--limit=${batchLimit}`];
  if (profile !== "all") translateArgs.push(`--profile=${profile}`);
  if (matchers.length > 0) translateArgs.push(`--match=${matchers.join(",")}`);
  const result = spawnSync(process.execPath, translateArgs, {
    stdio: "inherit",
    cwd: process.cwd(),
  });
  if (result.status !== 0) {
    console.error(`Translator exited with code ${result.status}`);
    process.exit(result.status ?? 1);
  }

  const pendingAfter = (await readStateJson("jobs.pending", "jobs/pending.json", [])).length;
  const doneAfter = (await readStateJson("jobs.done", "jobs/done.json", [])).length;

  if (pendingAfter === 0) {
    console.log("Translation pipeline completed.");
    break;
  }

  if (pendingAfter === previousPending && doneAfter === previousDone) {
    console.log("No forward progress detected in the last cycle. Stopping to avoid infinite loop.");
    break;
  }

  previousPending = pendingAfter;
  previousDone = doneAfter;
}

await closeMongoClient();
