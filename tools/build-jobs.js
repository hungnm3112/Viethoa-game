import fs from "node:fs";
import path from "node:path";
import { writeJson } from "./lib/json-store.js";
import { extractXmlStrings, groupForPath } from "./lib/strings.js";

const INPUT_ROOT = "input";
const JOB_FILE = "jobs/pending.json";
const args = parseArgs(process.argv.slice(2));
const maxStrings = Number(args["max-strings"] ?? 40);
const files = findFiles(INPUT_ROOT, ".xml");
const jobs = [];

for (const file of files) {
  const xml = fs.readFileSync(file, "utf8");
  const strings = extractXmlStrings(xml).map((item) => item.value);
  if (strings.length === 0) continue;

  const group = groupForPath(file);
  for (let index = 0; index < strings.length; index += maxStrings) {
    jobs.push({
      id: `${jobs.length + 1}`.padStart(5, "0"),
      group,
      inputFile: file.replaceAll("\\", "/"),
      outputFile: file.replaceAll("\\", "/").replace(/^input\//, "output/"),
      strings: strings.slice(index, index + maxStrings),
    });
  }
}

jobs.sort((a, b) => priority(a) - priority(b));
writeJson(JOB_FILE, jobs);
writeJson("jobs/done.json", []);
writeJson("jobs/failed.json", []);

console.log(`Created ${jobs.length} jobs in ${JOB_FILE}`);

function priority(job) {
  const groupPriority = { ui: 0, dialog: 1, gameplay: 2, misc: 3 };
  return groupPriority[job.group] ?? 9;
}

function findFiles(root, extension) {
  if (!fs.existsSync(root)) return [];
  const output = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) output.push(...findFiles(fullPath, extension));
    if (entry.isFile() && entry.name.toLowerCase().endsWith(extension)) output.push(fullPath);
  }
  return output;
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
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

