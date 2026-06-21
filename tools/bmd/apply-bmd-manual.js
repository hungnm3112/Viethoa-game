import fs from "node:fs";
import path from "node:path";
import { readPakIndex, extractEntry } from "../lib/pak.js";

const SOURCE_PAK = "data-game-park/gamedata.pak";
const CHUNKS_DIR = "output/languages/bmd_chunks";
const OUTPUT_ROOT = "output/gamedata";
const BMD_SIG = 0x55424d44;

console.log("Loading BMD translated chunks...");
const translations = new Map();
if (fs.existsSync(CHUNKS_DIR)) {
  for (const file of fs.readdirSync(CHUNKS_DIR)) {
    if (!file.endsWith('.json')) continue;
    const chunk = JSON.parse(fs.readFileSync(path.join(CHUNKS_DIR, file), "utf8"));
    if (chunk.replacements) {
      for (const r of chunk.replacements) {
        if (r.translatedText && r.translatedText.trim() !== "") {
          translations.set(r.sourceText, r.translatedText);
        }
      }
    }
  }
}
console.log(`Loaded ${translations.size} translations from chunks.`);

if (translations.size === 0) {
  console.log("No translations found. Exiting.");
  process.exit(0);
}

const pak = readPakIndex(SOURCE_PAK);
const bmdEntries = pak.entries.filter(e => e.name.endsWith(".bmd"));

let filesPatched = 0;
let totalApplied = 0;

for (const entry of bmdEntries) {
  if (!entry.name.includes("/items/") && 
      !entry.name.includes("/rts/expertise") && 
      !entry.name.includes("/rts/facilities") &&
      !entry.name.includes("/rts/characters") &&
      !entry.name.includes("/community/tasks")) continue;

  const bmd = extractEntry(pak, entry);
  if (bmd.readUInt32LE(0) !== BMD_SIG) continue;

  const tableOff = bmd.readUInt32LE(20);
  const outChunks = [bmd.subarray(0, tableOff)];
  let applied = 0;
  let start = tableOff;

  for (let offset = tableOff; offset < bmd.length; offset += 1) {
    if (bmd[offset] !== 0) continue;

    const sourceBytes = bmd.subarray(start, offset);
    const sourceText = sourceBytes.toString("utf8");
    
    if (translations.has(sourceText)) {
      outChunks.push(Buffer.from(translations.get(sourceText), "utf8"), Buffer.from([0]));
      applied += 1;
    } else {
      outChunks.push(sourceBytes, Buffer.from([0]));
    }
    
    start = offset + 1;
  }
  
  if (start < bmd.length) {
    outChunks.push(bmd.subarray(start));
  }

  if (applied > 0) {
    const patchedBuffer = Buffer.concat(outChunks);
    patchedBuffer.writeUInt32LE(patchedBuffer.length - tableOff, 24);
    
    const outputPath = path.join(OUTPUT_ROOT, entry.name);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, patchedBuffer);
    
    console.log(`Patched ${entry.name}: applied ${applied} strings.`);
    filesPatched++;
    totalApplied += applied;
  }
}

console.log(`Done. Patched ${filesPatched} files with ${totalApplied} total translation insertions.`);
