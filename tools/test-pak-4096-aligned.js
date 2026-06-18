/**
 * Diagnostic v2: rebuild PAK with ORIGINAL scenes.win.bmd + correct 4096-byte
 * data alignment matching the original PAK structure.
 *
 * Original PAK rule: each entry's compressed DATA starts at a 4096-byte boundary.
 * The local header is placed immediately before the data (no extra field).
 * Zero padding fills the gap between the previous entry's data end and the next header.
 * Exception: the very first entry (localOff=0) is NOT aligned.
 *
 * If game does NOT crash → alignment was the issue; ready to patch with translated BMD.
 * If game STILL crashes  → something else differs from original; investigate further.
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { readPakIndex, extractEntry } from './lib/pak.js';

const GAME_DIR    = 'D:/SteamLibrary/steamapps/common/State of Decay YOSE/Game';
const GAME_PAK    = path.join(GAME_DIR, 'gamedata.pak');
const BACKUP_DIR  = path.join(GAME_DIR, '_codex_pak_backup');
const SOURCE_PAK  = 'data-game-park/gamedata.pak';
const OUTPUT_PAK  = 'output/paks/gamedata-4096-aligned-test.pak';
const TARGET_ENTRY = 'libs/class3/contentmanager/scenes.win.bmd';

const CRC_TABLE = buildCrcTable();
const index = readPakIndex(SOURCE_PAK);
const origEntry = index.entries.find(e => e.name === TARGET_ENTRY);
if (!origEntry) { console.error('scenes.win.bmd not found in PAK'); process.exit(1); }

const originalBmd = extractEntry(index, origEntry);
console.log(`Using ORIGINAL scenes.win.bmd: ${originalBmd.length} bytes`);
console.log(`Source PAK: ${index.entries.length} entries`);

const { buffer, replaced, totalPadding } = buildPakWithOneReplacement(index, TARGET_ENTRY, originalBmd);
console.log(`Rebuilt PAK: ${buffer.length} bytes (total alignment padding: ${totalPadding} bytes), replaced ${replaced} entry(ies)`);

// Verify alignment of rebuilt PAK
verifyAlignment(buffer);

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
console.log('  NO crash → 4096 alignment fixed it; ready to deploy patched BMD.');
console.log('  CRASH    → something else is still wrong; need deeper investigation.');

// ---- builder ---------------------------------------------------------------

function buildPakWithOneReplacement(index, targetEntry, replacementContent) {
  const localParts  = [];
  const centralParts = [];
  const payloads    = new Map();
  let offset        = 0;
  let replaced      = 0;
  let totalPadding  = 0;
  let isFirst       = true;

  // Process entries in original file order (by localHeaderOffset)
  const localOrder = [...index.entries].sort((a, b) => a.localHeaderOffset - b.localHeaderOffset);

  for (const entry of localOrder) {
    const sourceLocal = readSourceLocal(index, entry);
    const isTarget    = entry.name === targetEntry;

    let compressed, uncompressedSize, crc32value;
    if (isTarget) {
      uncompressedSize = replacementContent.length;
      compressed   = entry.method === 8 ? zlib.deflateSync(replacementContent, { windowBits: 10 }) : replacementContent;
      crc32value   = crc32(replacementContent);
      replaced++;
    } else {
      compressed       = sourceLocal.compressed;
      uncompressedSize = entry.uncompressedSize;
      crc32value       = sourceLocal.crc;
    }

    const nameBytes  = sourceLocal.nameBytes;
    const headerSize = 30 + nameBytes.length;  // no extra field

    // Align data to next 4096-byte boundary (skip for very first entry — matches original)
    let padding = 0;
    if (!isFirst) {
      const dataStart        = offset + headerSize;
      const alignedDataStart = Math.ceil(dataStart / 4096) * 4096;
      padding = alignedDataStart - dataStart;
    }

    const localHeaderOffset = offset + padding;

    // Build local header
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
    localHeader.writeUInt16LE(nameBytes.length, 26);
    localHeader.writeUInt16LE(0, 28);  // no extra field

    if (padding > 0) localParts.push(Buffer.alloc(padding));
    localParts.push(localHeader, nameBytes, Buffer.from(compressed));

    payloads.set(entry.name, {
      localHeaderOffset,
      compressed,
      uncompressedSize,
      crc32value,
      sourceLocal,
      method: entry.method,
    });

    offset = localHeaderOffset + headerSize + compressed.length;
    totalPadding += padding;
    isFirst = false;
  }

  // Write central directory in original order
  const centralOffset = offset;
  for (const entry of index.entries) {
    const p = payloads.get(entry.name);
    const nameBytes = entry.centralNameBytes ?? p.sourceLocal.nameBytes;

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);   // version made by
    centralHeader.writeUInt16LE(20, 6);   // version needed
    centralHeader.writeUInt16LE(p.sourceLocal.flags, 8);
    centralHeader.writeUInt16LE(p.method, 10);
    centralHeader.writeUInt16LE(p.sourceLocal.modTime, 12);
    centralHeader.writeUInt16LE(p.sourceLocal.modDate, 14);
    centralHeader.writeUInt32LE(p.crc32value, 16);
    centralHeader.writeUInt32LE(p.compressed.length, 20);
    centralHeader.writeUInt32LE(p.uncompressedSize, 24);
    centralHeader.writeUInt16LE(nameBytes.length, 28);
    centralHeader.writeUInt16LE(0, 30);  // no extra
    centralHeader.writeUInt16LE(0, 32);  // no comment
    centralHeader.writeUInt16LE(0, 34);  // disk start
    centralHeader.writeUInt16LE(0, 36);  // internal attrs
    centralHeader.writeUInt32LE(0, 38);  // external attrs
    centralHeader.writeUInt32LE(p.localHeaderOffset, 42);

    centralParts.push(centralHeader, nameBytes);
  }

  const centralDir = Buffer.concat(centralParts);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);   // disk number
  eocd.writeUInt16LE(0, 6);   // disk with start of CD
  eocd.writeUInt16LE(index.entries.length, 8);   // entries on disk
  eocd.writeUInt16LE(index.entries.length, 10);  // total entries
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  eocd.writeUInt16LE(0, 20);  // comment length

  return {
    buffer: Buffer.concat([...localParts, centralDir, eocd]),
    replaced,
    totalPadding,
  };
}

// ---- verify alignment of rebuilt PAK -------------------------------------
function verifyAlignment(buf) {
  let eocdOff = buf.length - 22;
  while (buf.readUInt32LE(eocdOff) !== 0x06054b50) eocdOff--;
  const totalEntries  = buf.readUInt16LE(eocdOff + 10);
  const centralOffset = buf.readUInt32LE(eocdOff + 16);

  const entries = [];
  let off = centralOffset;
  for (let i = 0; i < totalEntries; i++) {
    const nameLen    = buf.readUInt16LE(off + 28);
    const extraLen   = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    entries.push({ localOff: buf.readUInt32LE(off + 42), compSize: buf.readUInt32LE(off + 20) });
    off += 46 + nameLen + extraLen + commentLen;
  }

  const sorted = [...entries].sort((a, b) => a.localOff - b.localOff);
  let unaligned = 0;
  for (let i = 1; i < sorted.length; i++) {  // skip first entry
    const e         = sorted[i];
    const localOff  = e.localOff;
    const nameLen   = buf.readUInt16LE(localOff + 26);
    const extraLen  = buf.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + nameLen + extraLen;
    if (dataStart % 4096 !== 0) unaligned++;
  }
  if (unaligned === 0)
    console.log(`Alignment check: OK — all ${sorted.length - 1} non-first entries have 4096-aligned data.`);
  else
    console.log(`Alignment check: FAIL — ${unaligned} entries NOT 4096-aligned.`);
}

// ---- helpers ---------------------------------------------------------------

function readSourceLocal(index, entry) {
  const buf  = index.buffer;
  const off  = entry.localHeaderOffset;
  const nameLen  = buf.readUInt16LE(off + 26);
  const extraLen = buf.readUInt16LE(off + 28);
  const dataOff  = off + 30 + nameLen + extraLen;
  return {
    versionNeeded: buf.readUInt16LE(off + 4),
    flags:         buf.readUInt16LE(off + 6),
    modTime:       buf.readUInt16LE(off + 10),
    modDate:       buf.readUInt16LE(off + 12),
    crc:           buf.readUInt32LE(off + 14),
    nameBytes:     Buffer.from(buf.subarray(off + 30, off + 30 + nameLen)),
    compressed:    buf.subarray(dataOff, dataOff + entry.compressedSize),
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