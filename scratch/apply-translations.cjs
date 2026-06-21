const fs = require('fs');
const path = require('path');

const cachePath = 'cache/translations.json';
const chunksDir = 'input/languages/chunks';
const outDir = 'output/languages/chunks';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

const files = fs.readdirSync(chunksDir).filter(f => f.endsWith('.json'));
let updatedChunks = 0;
let totalTranslated = 0;

for (const file of files) {
  const filePath = path.join(chunksDir, file);
  const outPath = path.join(outDir, file);
  
  // Start from output file if it exists, otherwise input file
  const chunk = JSON.parse(fs.readFileSync(fs.existsSync(outPath) ? outPath : filePath, 'utf8'));
  
  let modified = false;
  for (const rep of chunk.replacements) {
    if (!rep.translatedText && cache[rep.sourceText]) {
      rep.translatedText = cache[rep.sourceText].t;
      modified = true;
      totalTranslated++;
    }
  }
  
  if (modified) {
    fs.writeFileSync(outPath, JSON.stringify(chunk, null, 2), 'utf8');
    updatedChunks++;
  }
}

console.log(`Updated ${updatedChunks} chunks with ${totalTranslated} new translations.`);
