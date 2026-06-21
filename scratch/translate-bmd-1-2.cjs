const fs = require('fs');

const bmd_chunk_1_map = {
  "Pistol_g 17c": "Súng Lục (Pistol) G 17C",
  "Pistol Basic": "Súng Lục Cơ Bản (Pistol Basic)",
  "Pistol_g 20": "Súng Lục (Pistol) G 20",
  "Carrier 1911": "Súng Lục (Pistol) Carrier 1911",
  "Revolver Basic": "Súng Rulo Cơ Bản (Revolver Basic)",
  "SMG Basic": "Súng Tiểu Liên Cơ Bản (SMG Basic)",
  "Assault Basic": "Súng Trường Tấn Công Cơ Bản (Assault Basic)",
  "Rifle Basic": "Súng Trường Cơ Bản (Rifle Basic)",
  "Shotgun Basic": "Súng Shotgun Cơ Bản (Shotgun Basic)",
  "Russian 12K": "Súng Shotgun Russian 12K",
  "MG Basic": "Súng Máy Cơ Bản (MG Basic)"
};

const file1 = 'output/languages/bmd_chunks/bmd_chunk_1.json';
const c1 = JSON.parse(fs.readFileSync(fs.existsSync(file1) ? file1 : 'input/languages/bmd_chunks/bmd_chunk_1.json', 'utf8'));
for(const r of c1.replacements) {
  if(bmd_chunk_1_map[r.sourceText]) {
    r.translatedText = bmd_chunk_1_map[r.sourceText];
  }
}
fs.mkdirSync('output/languages/bmd_chunks', { recursive: true });
fs.writeFileSync(file1, JSON.stringify(c1, null, 2), 'utf8');

const file2 = 'output/languages/bmd_chunks/bmd_chunk_2.json';
const c2 = JSON.parse(fs.readFileSync(fs.existsSync(file2) ? file2 : 'input/languages/bmd_chunks/bmd_chunk_2.json', 'utf8'));
// No strings to translate in chunk 2, all paths/numbers
fs.writeFileSync(file2, JSON.stringify(c2, null, 2), 'utf8');

console.log('Translated BMD Chunk 1 and 2 successfully!');
