const fs = require('fs');
const xml = fs.readFileSync('input/gamedata/libs/class3/items/items.xml', 'utf8');
const matches = [...xml.matchAll(/Text=\"([^:]+): [^\"]+\"/g)];
const types = {};
matches.forEach(m => types[m[1]] = (types[m[1]]||0)+1);
Object.entries(types).sort((a,b)=>b[1]-a[1]).slice(0,30).forEach(([k,v]) => console.log(k, v));
