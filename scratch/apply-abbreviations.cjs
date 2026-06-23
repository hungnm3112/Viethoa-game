const fs = require('fs');
const path = require('path');
const { translateBtxtChunks } = require('../tools/lib/btxt.js');

const ABBREV_TABLE = JSON.parse(fs.readFileSync(path.join(__dirname, '../scripts/utils/abbrev-table.json'), 'utf8'));

function applyAbbreviations(text) {
  let result = text;
  for (const [long, short] of Object.entries(ABBREV_TABLE)) {
    result = result.replaceAll(long, short);
  }
  return result;
}

const CHUNKS_DIR = path.join(__dirname, '../output/languages/chunks');
if (fs.existsSync(CHUNKS_DIR)) {
  const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(CHUNKS_DIR, file);
    const chunk = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = false;
    
    if (chunk.replacements) {
      for (const r of chunk.replacements) {
        if (r.translatedText) {
          const newText = applyAbbreviations(r.translatedText);
          if (newText !== r.translatedText) {
            console.log(`[${file}] Abbreviated: ${r.translatedText} -> ${newText}`);
            r.translatedText = newText;
            changed = true;
          }
        }
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(chunk, null, 2));
      console.log(`Updated ${file} with abbreviations.`);
    }
  }
}

const BMD_CHUNKS_DIR = path.join(__dirname, '../output/languages/bmd_chunks');
if (fs.existsSync(BMD_CHUNKS_DIR)) {
  const files = fs.readdirSync(BMD_CHUNKS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(BMD_CHUNKS_DIR, file);
    const chunk = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = false;
    
    if (chunk.replacements) {
      for (const r of chunk.replacements) {
        if (r.translatedText) {
          const newText = applyAbbreviations(r.translatedText);
          if (newText !== r.translatedText) {
            console.log(`[BMD ${file}] Abbreviated: ${r.translatedText} -> ${newText}`);
            r.translatedText = newText;
            changed = true;
          }
        }
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(chunk, null, 2));
      console.log(`Updated BMD ${file} with abbreviations.`);
    }
  }
}
