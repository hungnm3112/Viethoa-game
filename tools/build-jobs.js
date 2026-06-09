import { writeJson } from "./lib/json-store.js";
import { appendEvent, createSession, saveSession, updateDashboard } from "./lib/translation-monitor.js";
import { buildJobs, parsePlannerArgs, readProfiles, resolveProfileMatchers } from "./lib/job-planner.js";

const INPUT_ROOT = "input";
const JOB_FILE = "jobs/pending.json";
const args = parsePlannerArgs(process.argv.slice(2));
const maxStrings = Number(args["max-strings"] ?? 40);
const profiles = readProfiles("config/translation-phases.json");
const profileMatchers = resolveProfileMatchers(args.profile, profiles);
const explicitMatchers = String(args.match ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const matchers = [...profileMatchers, ...explicitMatchers];
const jobs = buildJobs({ inputRoot: INPUT_ROOT, maxStrings, matchers });

writeJson(JOB_FILE, jobs);
writeJson("jobs/done.json", []);
writeJson("jobs/failed.json", []);

console.log(`Created ${jobs.length} jobs in ${JOB_FILE}`);
if (matchers.length > 0) {
  console.log(`Applied matchers: ${matchers.join(", ")}`);
}

const session = createSession({
  status: "queued",
  scope: args.profile ? `profile:${args.profile}` : matchers.length > 0 ? matchers.join(",") : "all",
  notes: [`Queued ${jobs.length} job(s)`],
});
saveSession(session);
appendEvent("jobs-built", {
  scope: session.scope,
  jobs: jobs.length,
  matchers,
});
updateDashboard({ session, scope: args.profile ?? "all", notes: session.notes });
