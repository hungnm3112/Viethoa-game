const fs = require('fs');
const src = fs.readFileSync('input/gamedata/libs/class3/items/items.xml', 'utf8');
const tgt = fs.readFileSync('output/gamedata/libs/class3/items/items.xml', 'utf8');
const srcMatches = [...src.matchAll(/Text=\"([^\"]+)\"/g)];
const tgtMatches = [...tgt.matchAll(/Text=\"([^\"]+)\"/g)];
const idx = srcMatches.findIndex(m => m[1].includes('Mk.16 Mod.0'));
console.log("SRC:", srcMatches[idx][1]);
console.log("TGT:", tgtMatches[idx][1]);
