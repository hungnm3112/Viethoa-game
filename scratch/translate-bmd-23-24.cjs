const fs = require('fs');

const map = {
  // Chunk 23
  "Doc Hanson": "Bác Sĩ Hanson",
  "Judge Lawton": "Thẩm Phán Lawton",
  "Pastor William": "Mục Sư William",

  // Chunk 24
  "LOG: Resisted Injury": "NHẬT KÝ: Vượt qua Chấn Thương",
  "LOG: Resisted Sickness": "NHẬT KÝ: Vượt qua Bệnh Tật",
  "Supplies a bonus when assigned to a kitchen": "Cung cấp thêm nhu yếu phẩm khi được phân công vào bếp."
};

function applyTranslations(chunkPath, mapData) {
  if (!fs.existsSync(chunkPath)) return;
  const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  for (const r of chunk.replacements) {
    // Exclude Dev strings
    if (
      r.sourceText.includes('Trait.') || 
      r.sourceText.includes('Aptitude.') || 
      r.sourceText.includes('Action.') || 
      r.sourceText.includes('Status.') || 
      r.sourceText.includes('Game.') || 
      r.sourceText.includes('Character.') || 
      r.sourceText.includes('Count.') ||
      r.sourceText === '-5' ||
      r.sourceText === '12.0' ||
      r.sourceText === '-20' ||
      r.sourceText === '-40' ||
      r.sourceText === '-30' ||
      r.sourceText === '100.0' ||
      r.sourceText === '14.28' ||
      r.sourceText === '16.7' ||
      r.sourceText === '25.0' ||
      r.sourceText === '33.3' ||
      r.sourceText === '50.0' ||
      r.sourceText.startsWith('!')
    ) {
      continue;
    }
    if (mapData[r.sourceText]) {
      r.translatedText = mapData[r.sourceText];
    }
  }
  fs.mkdirSync('output/languages/bmd_chunks', { recursive: true });
  fs.writeFileSync(chunkPath.replace('input/languages/', 'output/languages/'), JSON.stringify(chunk, null, 2), 'utf8');
}

applyTranslations('input/languages/bmd_chunks/bmd_chunk_23.json', map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_24.json', map);
console.log('Translated BMD Chunk 23 and 24 successfully!');
