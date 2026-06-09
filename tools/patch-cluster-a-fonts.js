import fs from "node:fs";
import path from "node:path";
import { collectTags, readSwfLike } from "./lib/swf.js";

const SOURCE_GFX = "output/gfxdump/libs/ui/class3_pause.gfx";
const SOURCE_FONT_NAME = "Arial";
const TARGET_FONT_NAME = "Font_Body";
const TARGETS = [
  "output/gfxdump/libs/ui/menus_startmenu.gfx",
  "output/gfxdump/libs/ui/menus_confirmation.gfx",
  "output/gfxdump/libs/ui/entityflashtag.gfx",
];
const OUTPUT_ROOT = "output/gamedata/libs/ui";

const pause = readSwfLike(SOURCE_GFX);
const sourceFont = collectTags(pause.tags, (tag) => tag.code === 48 || tag.code === 75).find(
  (tag) => normalizeFontName(tag.fontName) === SOURCE_FONT_NAME,
);

if (!sourceFont) {
  throw new Error(`Could not find ${SOURCE_FONT_NAME} in ${SOURCE_GFX}`);
}

for (const targetFile of TARGETS) {
  patchTarget(targetFile, sourceFont);
}

function patchTarget(targetFile, fontTag) {
  const swf = readSwfLike(targetFile);
  const importTags = collectTags(swf.tags, (tag) => tag.code === 57 || tag.code === 71).filter((tag) =>
    (tag.imports ?? []).some((entry) => entry.name === "Font_Body"),
  );

  if (importTags.length === 0) {
    throw new Error(`No Font_Body import found in ${targetFile}`);
  }

  let output = swf.buffer;
  const replacements = [];

  for (const tag of importTags.sort((a, b) => b.offset - a.offset)) {
    const importEntry = tag.imports.find((entry) => entry.name === "Font_Body");
    const replacementTag = buildFontReplacementTag(fontTag, importEntry.characterId, TARGET_FONT_NAME);
    output = Buffer.concat([output.subarray(0, tag.offset), replacementTag, output.subarray(tag.endOffset)]);
    replacements.push({
      importUrl: tag.importUrl,
      characterId: importEntry.characterId,
      replacementFont: SOURCE_FONT_NAME,
    });
  }

  output.writeUInt32LE(output.length, 4);

  const outputFile = path.join(OUTPUT_ROOT, path.basename(targetFile));
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, output);

  console.log(`Wrote ${outputFile}`);
  for (const item of replacements) {
    console.log(
      `- Replaced import ${item.importUrl}::Font_Body with embedded ${item.replacementFont} (fontId ${item.characterId})`,
    );
  }
}

function buildFontReplacementTag(sourceTag, targetFontId, targetFontName) {
  const content = sourceTag.raw.subarray(sourceTag.headerSize);
  const flags1 = content[2];
  const languageCode = content[3];
  const sourceNameLen = content[4];
  const nameEnd = 5 + sourceNameLen;
  const fontNameBytes = Buffer.from(targetFontName, "latin1");
  const rest = content.subarray(nameEnd);

  const newContent = Buffer.concat([
    writeUInt16LE(targetFontId),
    Buffer.from([flags1, languageCode, fontNameBytes.length]),
    fontNameBytes,
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
  return String(name ?? "").replace(/\0+$/, "");
}
