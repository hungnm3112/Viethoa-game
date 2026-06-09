import fs from "node:fs";
import path from "node:path";
import { extractEntry, readPakIndex } from "./lib/pak.js";

const PAK_PATH = "data-game-park/gamedata.pak";
const SOURCE_XML = "input/gamedata/languages/embeddedstrings.xml";
const TRANSLATED_XML = "output/gamedata/languages/embeddedstrings.xml";
const OUTPUT_FILE = "output/gamedata/languages/english.win.btxt";
const REPORT_FILE = "output/reports/build-btxt-report.json";

const sourceMap = readEmbeddedTextMap(SOURCE_XML);
const translatedMap = readEmbeddedTextMap(TRANSLATED_XML);
const replacements = [];

for (const [id, sourceText] of sourceMap.entries()) {
  const translatedText = translatedMap.get(id);
  if (!translatedText) continue;
  if (translatedText === sourceText) continue;
  replacements.push({ id, sourceText, translatedText });
}

if (replacements.length === 0) {
  throw new Error("No translated EmbeddedText entries found to patch into english.win.btxt.");
}

const index = readPakIndex(PAK_PATH);
const entry = index.entries.find((item) => item.name === "languages/english.win.btxt");

if (!entry) {
  throw new Error("Could not find languages/english.win.btxt in gamedata.pak");
}

let patched = extractEntry(index, entry);
const stats = {
  totalCandidates: replacements.length,
  patched: [],
  skippedMissing: [],
  skippedAmbiguous: [],
};

for (const item of replacements) {
  const fromBytes = Buffer.from(`${item.sourceText}\0`, "utf8");
  const toBytes = Buffer.from(`${item.translatedText}\0`, "utf8");
  const matches = findAllMatches(patched, fromBytes);

  if (matches.length === 0) {
    stats.skippedMissing.push(item);
    continue;
  }

  if (matches.length > 1) {
    stats.skippedAmbiguous.push({ ...item, matches: matches.length });
    continue;
  }

  const offset = matches[0];
  patched = Buffer.concat([
    patched.subarray(0, offset),
    toBytes,
    patched.subarray(offset + fromBytes.length),
  ]);
  stats.patched.push(item);
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, patched);

const report = {
  generatedAt: new Date().toISOString(),
  sourceXml: SOURCE_XML,
  translatedXml: TRANSLATED_XML,
  outputFile: OUTPUT_FILE,
  totals: {
    candidates: stats.totalCandidates,
    patched: stats.patched.length,
    skippedMissing: stats.skippedMissing.length,
    skippedAmbiguous: stats.skippedAmbiguous.length,
  },
  samples: {
    patched: stats.patched.slice(0, 20),
    skippedMissing: stats.skippedMissing.slice(0, 20),
    skippedAmbiguous: stats.skippedAmbiguous.slice(0, 20),
  },
};

fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log(`Wrote ${OUTPUT_FILE}`);
console.log(`Wrote ${REPORT_FILE}`);
console.log(
  `Patched ${stats.patched.length}/${stats.totalCandidates} translated strings. Missing: ${stats.skippedMissing.length}. Ambiguous: ${stats.skippedAmbiguous.length}.`,
);
console.log("Copy this file to:");
console.log("D:\\SteamLibrary\\steamapps\\common\\State of Decay YOSE\\Game\\languages\\english.win.btxt");

function readEmbeddedTextMap(filePath) {
  const xml = fs.readFileSync(filePath, "utf8");
  const map = new Map();
  for (const match of xml.matchAll(/<EmbeddedText\b[^>]*\bId=\"([^\"]+)\"[^>]*\bText=\"([^\"]*)\"[^>]*\/>/g)) {
    map.set(match[1], decodeXml(match[2]));
  }
  return map;
}

function decodeXml(value) {
  return value.replace(/&(#x?[0-9a-fA-F]+|amp|lt|gt|quot|apos);/g, (match, entity) => {
    if (entity.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }
    return (
      {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: "\"",
        apos: "'",
      }[entity] ?? match
    );
  });
}

function findAllMatches(buffer, needle) {
  const matches = [];
  let offset = 0;
  while (offset < buffer.length) {
    const found = buffer.indexOf(needle, offset);
    if (found === -1) break;
    matches.push(found);
    offset = found + needle.length;
  }
  return matches;
}
