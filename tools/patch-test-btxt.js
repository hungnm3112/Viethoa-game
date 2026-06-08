import fs from "node:fs";
import path from "node:path";
import { extractEntry, readPakIndex } from "./lib/pak.js";

const PAK_PATH = "data-game-park/gamedata.pak";
const OUTPUT_FILE = "output/gamedata/languages/english.win.btxt";
const WINDOWS_1258_MAP = new Map([
  ["\u0102", 0xc3],
  ["\u0103", 0xe3],
  ["\u00c2", 0xc2],
  ["\u00e2", 0xe2],
  ["\u00ca", 0xca],
  ["\u00ea", 0xea],
  ["\u00d4", 0xd4],
  ["\u00f4", 0xf4],
  ["\u01a0", 0xd5],
  ["\u01a1", 0xf5],
  ["\u01af", 0xdd],
  ["\u01b0", 0xfd],
  ["\u0110", 0xd0],
  ["\u0111", 0xf0],
  ["\u0300", 0xcc],
  ["\u0301", 0xec],
  ["\u0303", 0xde],
  ["\u0323", 0xf2],
  ["\u0309", 0xd2],
]);
const WINDOWS_1258_COMPOSITE_MAP = new Map([
  ["\u1ebf", [0xea, 0xec]],
  ["\u1ebe", [0xca, 0xec]],
]);

// Keep this test tiny and targeted. One exact menu string is enough to prove
// whether a loose english.win.btxt override is viable without destabilizing
// the rest of the file.
// Keep replacement byte length identical to the original string length.
// "Continue" is 8 bytes, and "Ti\u00eap tuc" is also 8 bytes in windows-1258.
const replacements = [["Continue", "Ti\u00eap tuc"]];

const index = readPakIndex(PAK_PATH);
const entry = index.entries.find((item) => item.name === "languages/english.win.btxt");

if (!entry) {
  throw new Error("Could not find languages/english.win.btxt in gamedata.pak");
}

const source = extractEntry(index, entry);
const patched = Buffer.from(source);
const encode1258 = makeWindows1258Encoder();
const stringEntries = collectNullTerminatedStrings(patched, 331076);

for (const [from, to] of replacements) {
  replaceExactString(stringEntries, patched, encode1258(from), encode1258(to), from, to);
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, patched);

console.log(`Wrote ${OUTPUT_FILE}`);
console.log("Copy this file to:");
console.log("D:\\SteamLibrary\\steamapps\\common\\State of Decay YOSE\\Game\\languages\\english.win.btxt");

function collectNullTerminatedStrings(buffer, startOffset) {
  const entries = [];
  let start = startOffset;

  while (start < buffer.length) {
    let end = start;
    while (end < buffer.length && buffer[end] !== 0) {
      end += 1;
    }

    if (end > start) {
      entries.push({
        start,
        end,
        bytes: buffer.subarray(start, end),
      });
    }

    start = end + 1;
  }

  return entries;
}

function replaceExactString(entries, buffer, fromBytes, toBytes, fromLabel, toLabel) {
  const matches = entries.filter((entry) => entry.bytes.equals(fromBytes));

  if (matches.length === 0) {
    throw new Error(`Exact string not found in btxt: ${fromLabel}`);
  }

  if (matches.length > 1) {
    throw new Error(`Exact string is ambiguous in btxt: ${fromLabel} (${matches.length} matches)`);
  }

  if (toBytes.length !== fromBytes.length) {
    throw new Error(
      `Replacement length mismatch: "${fromLabel}" -> "${toLabel}" (${toBytes.length} !== ${fromBytes.length})`,
    );
  }

  const match = matches[0];
  toBytes.copy(buffer, match.start);
}

function makeWindows1258Encoder() {
  return function encode(text) {
    const bytes = [];
    for (const char of text) {
      const code = char.codePointAt(0);
      if (code !== undefined && code <= 0x7f) {
        bytes.push(code);
        continue;
      }

      const composite = WINDOWS_1258_COMPOSITE_MAP.get(char);
      if (composite) {
        bytes.push(...composite);
        continue;
      }

      const mapped = WINDOWS_1258_MAP.get(char);
      if (mapped === undefined) {
        throw new Error(`Cannot encode character ${JSON.stringify(char)} in windows-1258`);
      }
      bytes.push(mapped);
    }
    return Buffer.from(bytes);
  };
}
