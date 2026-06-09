import fs from "node:fs";
import path from "node:path";
import { latestBackups } from "./lib/translation-monitor.js";

const args = parseArgs(process.argv.slice(2));
const entries = latestBackups();
const matcher = String(args.file ?? "").trim().replaceAll("\\", "/");

const selected = matcher
  ? entries.filter((entry) => entry.target.endsWith(matcher))
  : entries;

if (selected.length === 0) {
  console.log("No backup matched.");
  process.exit(0);
}

for (const entry of selected) {
  const target = path.join("output", entry.target);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(entry.backup, target);
  console.log(`Restored ${target} from ${entry.backup}`);
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
