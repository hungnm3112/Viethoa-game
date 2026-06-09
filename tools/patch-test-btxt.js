import fs from "node:fs";
import path from "node:path";
import { extractEntry, readPakIndex } from "./lib/pak.js";

const PAK_PATH = "data-game-park/gamedata.pak";
const OUTPUT_FILE = "output/gamedata/languages/english.win.btxt";

// The localized game files vary in size across languages, and the shipped
// French/German/Portuguese files clearly store accented characters as UTF-8.
// This patch updates the visible main menu strings and allows the file to grow.
const replacements = [
  ["Continue", "Tiếp tục"],
  ["Start a New Game", "Chơi mới"],
  ["Select Profile", "Chọn hồ sơ"],
  ["Leaderboards", "Xếp hạng"],
  ["Achievements", "Thành tích"],
  ["Help & Options", "Trợ giúp"],
  ["Exit Game", "Thoát game"],
];

const index = readPakIndex(PAK_PATH);
const entry = index.entries.find((item) => item.name === "languages/english.win.btxt");

if (!entry) {
  throw new Error("Could not find languages/english.win.btxt in gamedata.pak");
}

let patched = extractEntry(index, entry);

for (const [from, to] of replacements) {
  patched = replaceExactString(patched, Buffer.from(`${from}\0`, "utf8"), Buffer.from(`${to}\0`, "utf8"), from, to);
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, patched);

console.log(`Wrote ${OUTPUT_FILE}`);
console.log("Copy this file to:");
console.log("D:\\SteamLibrary\\steamapps\\common\\State of Decay YOSE\\Game\\languages\\english.win.btxt");

function replaceExactString(buffer, fromBytes, toBytes, fromLabel, toLabel) {
  const matchOffset = findUniqueMatch(buffer, fromBytes, fromLabel);
  return Buffer.concat([
    buffer.subarray(0, matchOffset),
    toBytes,
    buffer.subarray(matchOffset + fromBytes.length),
  ]);
}

function findUniqueMatch(buffer, needle, label) {
  const first = buffer.indexOf(needle);
  if (first === -1) {
    throw new Error(`Exact string not found in btxt: ${label}`);
  }

  const second = buffer.indexOf(needle, first + 1);
  if (second !== -1) {
    throw new Error(`Exact string is ambiguous in btxt: ${label}`);
  }

  return first;
}
