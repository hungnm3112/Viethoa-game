import fs from "node:fs";
import path from "node:path";
import { collectTags, readSwfLike } from "./lib/swf.js";

const FRONTEND_INPUT = "output/gfxdump/libs/ui/class3_frontend.gfx";
const PAUSE_INPUT = "output/gfxdump/libs/ui/class3_pause.gfx";
const OUTPUT_FILE = "output/gamedata/libs/ui/class3_frontend.gfx";
const FONT_NAMES_TO_REPLACE = new Set(["Decaying Kuntry", "BrainsForSale"]);
const SOURCE_FONT_NAME = "Arial";

const frontend = readSwfLike(FRONTEND_INPUT);
const pause = readSwfLike(PAUSE_INPUT);

const frontendFonts = collectTags(frontend.tags, (tag) => tag.code === 48 || tag.code === 75);
const pauseFonts = collectTags(pause.tags, (tag) => tag.code === 48 || tag.code === 75);

const sourceFont = pauseFonts.find((tag) => normalizeFontName(tag.fontName) === SOURCE_FONT_NAME);
if (!sourceFont) {
  throw new Error(`Could not find embedded ${SOURCE_FONT_NAME} font in ${PAUSE_INPUT}`);
}

let output = frontend.buffer;
const targets = frontendFonts
  .filter((tag) => FONT_NAMES_TO_REPLACE.has(normalizeFontName(tag.fontName)))
  .sort((a, b) => b.offset - a.offset);

if (targets.length === 0) {
  throw new Error(`Could not find target fonts in ${FRONTEND_INPUT}`);
}

for (const target of targets) {
  const replacementTag = buildFontReplacementTag(sourceFont, target.fontId, target.fontName);
  output = Buffer.concat([output.subarray(0, target.offset), replacementTag, output.subarray(target.endOffset)]);
}

// Preserve Scaleform GFX signature but update file length.
output.writeUInt32LE(output.length, 4);

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, output);

console.log(`Wrote ${OUTPUT_FILE}`);
console.log("Replaced embedded menu fonts with Arial glyph data for:");
for (const target of targets) {
  console.log(`- ${normalizeFontName(target.fontName)} (fontId ${target.fontId})`);
}
console.log("Copy this file to:");
console.log("D:\\SteamLibrary\\steamapps\\common\\State of Decay YOSE\\Game\\libs\\ui\\class3_frontend.gfx");

function buildFontReplacementTag(sourceTag, targetFontId, targetFontName) {
  const content = sourceTag.raw.subarray(sourceTag.headerSize);
  const flags1 = content[2];
  const languageCode = content[3];
  const sourceNameLen = content[4];
  const sourceNameEnd = 5 + sourceNameLen;
  const rest = content.subarray(sourceNameEnd);
  const targetNameBytes = Buffer.from(targetFontName, "latin1");

  const newContent = Buffer.concat([
    writeUInt16LE(targetFontId),
    Buffer.from([flags1, languageCode, targetNameBytes.length]),
    targetNameBytes,
    rest,
  ]);

  return Buffer.concat([encodeTagHeader(sourceTag.code, newContent.length), newContent]);
}

function encodeTagHeader(code, length) {
  if (length < 0x3f) {
    const header = Buffer.alloc(2);
    header.writeUInt16LE((code << 6) | length, 0);
    return header;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE((code << 6) | 0x3f, 0);
  header.writeUInt32LE(length, 2);
  return header;
}

function writeUInt16LE(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value, 0);
  return buffer;
}

function normalizeFontName(name) {
  return name.replace(/\0+$/, "");
}
