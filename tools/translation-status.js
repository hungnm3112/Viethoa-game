import fs from "node:fs";
import path from "node:path";
import { extractXmlStrings, normalizeText } from "./lib/strings.js";

const args = parseArgs(process.argv.slice(2));
const profiles = readProfiles("config/translation-phases.json");
const profileMatchers = resolveProfileMatchers(args.profile, profiles);
const explicitMatchers = String(args.match ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const matchers = [...profileMatchers, ...explicitMatchers];
const files = findFiles("input", ".xml").filter((file) => matches(file, matchers));

if (files.length === 0) {
  console.log("No input XML files matched.");
  process.exit(0);
}

const rows = [];
let totalSource = 0;
let totalTranslated = 0;

for (const inputFile of files) {
  const outputFile = inputFile.replace(/^input[\\/]/, "output/");
  const sourceStrings = loadStrings(inputFile);
  const translatedStrings = fs.existsSync(outputFile) ? loadStrings(outputFile) : [];
  let translatedCount = 0;

  const total = Math.min(sourceStrings.length, translatedStrings.length);
  for (let index = 0; index < total; index += 1) {
    const source = sourceStrings[index];
    const translated = translatedStrings[index];
    if (normalizeText(translated) === normalizeText(source)) continue;
    translatedCount += 1;
  }

  totalSource += sourceStrings.length;
  totalTranslated += translatedCount;
  rows.push({
    file: inputFile.replaceAll("\\", "/"),
    total: sourceStrings.length,
    translated: translatedCount,
    percent: sourceStrings.length === 0 ? 0 : (translatedCount / sourceStrings.length) * 100,
  });
}

for (const row of rows.sort((a, b) => a.file.localeCompare(b.file))) {
  console.log(
    `${row.file} :: ${row.translated}/${row.total} translated (${row.percent.toFixed(1)}%)`,
  );
}

const percent = totalSource === 0 ? 0 : (totalTranslated / totalSource) * 100;
console.log(`TOTAL :: ${totalTranslated}/${totalSource} translated (${percent.toFixed(1)}%)`);

function loadStrings(filePath) {
  const xml = fs.readFileSync(filePath, "utf8");
  return extractXmlStrings(xml).map((item) => item.value);
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

function readProfiles(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function resolveProfileMatchers(profileArg, profiles) {
  const profileNames = String(profileArg ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const matchers = [];
  for (const profileName of profileNames) {
    const profile = profiles[profileName];
    if (!profile) {
      throw new Error(`Unknown profile "${profileName}" in config/translation-phases.json`);
    }
    for (const matcher of profile.match ?? []) {
      if (!matchers.includes(matcher)) matchers.push(matcher);
    }
  }

  return matchers;
}

function matches(filePath, matchers) {
  if (matchers.length === 0) return true;
  const normalized = filePath.replaceAll("\\", "/");
  return matchers.some((matcher) => normalized.includes(matcher));
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
