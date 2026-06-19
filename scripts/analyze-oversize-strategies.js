import fs from "node:fs";

function removeAccents(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

const rep = JSON.parse(fs.readFileSync("output/reports/oversize-strings.json", "utf8"));

let totalOversized = 0;
let autofixableCount = 0;
let hardCount = 0;
const hardStrings = [];

for (const file in rep) {
  for (const item of rep[file]) {
    totalOversized++;
    const unaccented = removeAccents(item.trans);
    const unaccentedBytes = Buffer.byteLength(unaccented, "utf8");
    
    if (unaccentedBytes <= item.origBytes) {
      autofixableCount++;
    } else {
      hardCount++;
      hardStrings.push({
        file,
        orig: item.orig,
        trans: item.trans,
        unaccented,
        origBytes: item.origBytes,
        unaccentedBytes,
        overflow: unaccentedBytes - item.origBytes
      });
    }
  }
}

console.log(`Total Oversized Strings: ${totalOversized}`);
console.log(`Auto-fixable by dropping accents: ${autofixableCount}`);
console.log(`Hard strings requiring manual translation: ${hardCount}`);

fs.writeFileSync("output/reports/hard-strings.json", JSON.stringify(hardStrings, null, 2));
console.log(`Wrote hard strings to output/reports/hard-strings.json`);
