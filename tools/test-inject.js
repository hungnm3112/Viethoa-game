import fs from "node:fs";
import { readSwfLike } from "./lib/swf.js";
import { loadArialSourceFont } from "./lib/font-replacer.js";

// Helper copied from font-replacer.js
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

try {
  const sourceFont = loadArialSourceFont("output/gfxdump/libs/ui/class3_pause.gfx", "Arial");
  
  const targetFile = "output/gfxdump/libs/ui/class3hud.gfx";
  const swf = readSwfLike(targetFile);
  
  // Create injected tags
  const tag1 = buildFontReplacementTag(sourceFont, 4001, "Decaying Kuntry");
  const tag2 = buildFontReplacementTag(sourceFont, 4002, "BrainsForSale");
  const tag3 = buildFontReplacementTag(sourceFont, 4003, "ZomNotes");
  
  const injectedTags = Buffer.concat([tag1, tag2, tag3]);
  
  // Insert at the beginning of the tags (after SWF header)
  const tagOffset = swf.header.tagOffset;
  const output = Buffer.concat([
    swf.buffer.subarray(0, tagOffset),
    injectedTags,
    swf.buffer.subarray(tagOffset)
  ]);
  
  // Update SWF file size in header (offset 4)
  output.writeUInt32LE(output.length, 4);
  
  fs.writeFileSync("output/gamedata/libs/ui/class3hud.gfx", output);
  console.log("Successfully injected fonts into class3hud.gfx!");
} catch(e) {
  console.error(e);
}
