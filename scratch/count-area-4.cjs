const fs = require('fs');
const dir = 'input/languages/chunks/';
const files = fs.readdirSync(dir);
let total = 0;
let untranslated = 0;

files.forEach(f => {
  if(!f.startsWith('btxt_chunk_')) return;
  const match = f.match(/btxt_chunk_(\d+)/);
  if(!match) return;
  const num = parseInt(match[1]);
  if(num >= 100) {
    const outPath = 'output/languages/chunks/' + f;
    const c = JSON.parse(fs.readFileSync(fs.existsSync(outPath) ? outPath : dir + f, 'utf8'));
    total += c.replacements.length;
    untranslated += c.replacements.filter(r => !r.translatedText).length;
  }
});
console.log('Area 4 Total:', total);
console.log('Area 4 Untranslated:', untranslated);
