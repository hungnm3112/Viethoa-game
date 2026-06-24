const fs = require('fs');
const path = require('path');

let mismatchFound = false;

function checkText(src, dst, file, id) {
  const pattern = /%[0-9]*\$?[0-9]*\.?[0-9]*[a-zA-Z]/g;
  const srcMatch = src.match(pattern) || [];
  const dstMatch = dst.match(pattern) || [];
  srcMatch.sort();
  dstMatch.sort();
  if (srcMatch.join(',') !== dstMatch.join(',')) {
    console.log(`Mismatch in ${file} (ID: ${id}):`);
    console.log(`Src: ${src}`);
    console.log(`Dst: ${dst}`);
    console.log(`Src formats: ${srcMatch.join(',')}`);
    console.log(`Dst formats: ${dstMatch.join(',')}`);
    console.log('-------------------------');
    mismatchFound = true;
  }
}

// Check JSON files
const chunksDir = 'output/languages/chunks';
if (fs.existsSync(chunksDir)) {
  const files = fs.readdirSync(chunksDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(chunksDir, file), 'utf8'));
    for (const rep of data.replacements || []) {
      if (!rep.translatedText) continue;
      checkText(rep.sourceText, rep.translatedText, file, rep.id);
    }
  }
}

// Check CJS files
const scratchDir = 'scratch';
if (fs.existsSync(scratchDir)) {
  const cjsFiles = fs.readdirSync(scratchDir).filter(f => f.endsWith('.cjs') && f.startsWith('translate-'));
  for (const file of cjsFiles) {
    try {
      const data = require(path.join(process.cwd(), scratchDir, file));
      for (const [src, dst] of Object.entries(data)) {
        if (!dst) continue;
        checkText(src, dst, file, "CJS_ENTRY");
      }
    } catch(e) {}
  }
}

if (!mismatchFound) {
  console.log("No format mismatches found in JSON or CJS files.");
}
