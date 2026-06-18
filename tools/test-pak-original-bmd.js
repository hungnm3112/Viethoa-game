/**
 * Diagnostic: rebuild gamedata.pak using our builder logic but with the
 * ORIGINAL (unpatched) scenes.win.bmd. If game still crashes → PAK builder
 * structure is broken. If no crash → the crash is from patched BMD content.
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { readPakIndex, extractEntry } from './lib/pak.js';

const GAME_DIR = 'D:/SteamLibrary/steamapps/common/State of Decay YOSE/Game';
const GAME_PAK  = path.join(GAME_DIR, 'gamedata.pak');
const BACKUP_DIR = path.join(GAME_DIR, '_codex_pak_backup');
const SOURCE_PAK = 'data-game-park/gamedata.pak';
const OUTPUT_PAK = 'output/paks/gamedata-original-bmd-test.pak';
const TARGET_ENTRY = 'libs/class3/contentmanager/scenes.win.bmd';

const CRC_TABLE = buildCrcTable();
const index = readPakIndex(SOURCE_PAK);
const origEntry = index.entries.find(e => e.name === TARGET_ENTRY);
if (!origEntry) { console.error('scenes.win.bmd not in PAK'); process.exit(1); }

// Use original (unpatched) BMD from source PAK
const originalBmd = extractEntry(index, origEntry);
console.log(`Using ORIGINAL scenes.win.bmd: ${originalBmd.length} bytes`);
console.log(`Source PAK: ${index.entries.length} entries`);

const { buffer, replaced } = buildPakWithOneReplacement(index, TARGET_ENTRY, originalBmd);
console.log(`Rebuilt PAK: ${buffer.length} bytes, replaced ${replaced} entry(ies)`);

fs.mkdirSync(path.dirname(OUTPUT_PAK), { recursive: true });
fs.writeFileSync(OUTPUT_PAK, buffer);
console.log(`Written → ${OUTPUT_PAK}`);

if (!fs.existsSync(GAME_DIR)) { console.log('Game dir not found, skipping deploy.'); process.exit(0); }

fs.mkdirSync(BACKUP_DIR, { recursive: true });
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `gamedata.pak.${ts}.bak`);
if (fs.existsSync(GAME_PAK)) {
  fs.copyFileSync(GAME_PAK, backupPath);
  console.log(`Backed up → ${backupPath}`);
}

fs.copyFileSync(OUTPUT_PAK, GAME_PAK);
console.log(`Deployed → ${GAME_PAK}`);
console.log('');
console.log('TEST: Launch game.');
console.log('  NO crash → PAK builder is fine; crash is from patched BMD content.');
console.log('  CRASH    → PAK builder is broken; fix structure before testing BMD.');

// ---- helpers ---- (no alignment padding — match original PAK structure) ----

function buildPakWithOneReplacement(index, targetEntry, replacementContent) {
  const localParts = [];
  const centralParts = [];
  const payloads = new Map();
  let offset = 0;
  let replaced = 0;

  const localOrder = [...index.entries].sort((a, b) => a.localHeaderOffset - b.localHeaderOffset);

  for (const entry of localOrder) {
    const sourceLocal = readSourceLocal(index, entry);
    const isTarget = entry.name === targetEntry;

    let compressed, uncompressedSize, crc32value;
    if (isTarget) {
      uncompressedSize = replacementContent.length;
      compressed = entry.method === 8
        ? zlib.deflateSync(replacementContent)
        : replacementContent;
      crc32value = crc32(replacementContent);
      replaced++;
    } else {
      compressed = sourceLocal.compressed;
      uncompressedSize = entry.uncompressedSize;
      crc32value = sourceLocal.crc;
    }

    const localHeaderOffset = offset;
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(sourceLocal.versionNeeded, 4);
    localHeader.writeUInt16LE(sourceLocal.flags, 6);
    localHeader.writeUInt16LE(entry.method, 8);
    localHeader.writeUInt16LE(sourceLocal.modTime, 10);
    localHeader.writeUInt16LE(sourceLocal.modDate, 12);
    localHeader.writeUInt32LE(crc32value, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(sourceLocal.nameBytes.length, 26);
    localHeader.writeUInt16LE(0, 28);  // no extra field

    localParts.push(localHeader, sourceLocal.nameBytes, Buffer.from(compressed));
    payloads.set(entry.name, { localHeaderOffset, compressed, uncompressedSize, crc32value, sourceLocal, method: entry.method });
    offset += 30 + sourceLocal.nameBytes.length + compressed.length;
  }

  const centralOffset = offset;
  for (const entry of index.entries) {
    const p = payloads.get(entry.name);
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(p.sourceLocal.flags, 8);
    centralHeader.writeUInt16LE(p.method, 10);
    centralHeader.writeUInt16LE(p.sourceLocal.modTime, 12);
    centralHeader.writeUInt16LE(p.sourceLocal.modDate, 14);
    centralHeader.writeUInt32LE(p.crc32value, 16);
    centralHeader.writeUInt32LE(p.compressed.length, 20);
    centralHeader.writeUInt32LE(p.uncompressedSize, 24);
    centralHeader.writeUInt16LE((entry.centralNameBytes ?? p.sourceLocal.nameBytes).length, 28);
    centralHeader.writeUInt16LE(0, 30);  // no extra
    centralHeader.writeUInt16LE(0, 32);  // no comment
    centralHeader.writeUInt16LE(0, 34);  // disk start
    centralHeader.writeUInt16LE(0, 36);  // internal attrs
    centralHeader.writeUInt32LE(0, 38);  // external attrs
    centralHeader.writeUInt32LE(p.localHeaderOffset, 42);
    centralParts.push(centralHeader, entry.centralNameBytes ?? p.sourceLocal.nameBytes);
  }

  const centralDir = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(index.entries.length, 8);
  eocd.writeUInt16LE(index.entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return { buffer: Buffer.concat([...localParts, centralDir, eocd]), replaced };
}

function readSourceLocal(index, entry) {
  const buf = index.buffer;
  const off = entry.localHeaderOffset;
  const nameLen = buf.readUInt16LE(off + 26);
  const extraLen = buf.readUInt16LE(off + 28);
  const dataOff = off + 30 + nameLen + extraLen;
  return {
    versionNeeded: buf.readUInt16LE(off + 4),
    flags: buf.readUInt16LE(off + 6),
    modTime: buf.readUInt16LE(off + 10),
    modDate: buf.readUInt16LE(off + 12),
    crc: buf.readUInt32LE(off + 14),
    nameBytes: Buffer.from(buf.subarray(off + 30, off + 30 + nameLen)),
    compressed: buf.subarray(dataOff, dataOff + entry.compressedSize),
  };
}

function buildCrcTable() {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let v = i;
    for (let b = 0; b < 8; b++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
    t[i] = v >>> 0;
  }
  return t;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
