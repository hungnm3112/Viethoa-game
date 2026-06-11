import { loadSession, updateDashboard } from "./lib/translation-monitor.js";
import { closeMongoClient } from "./lib/mongo-store.js";

const args = parseArgs(process.argv.slice(2));
const scope = args.profile ?? "all";
const dashboard = await updateDashboard({
  session: await loadSession(),
  scope,
});

console.log(`Wrote ${dashboard.files.length} file rows to output/reports/translation-dashboard.json`);
await closeMongoClient();

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
