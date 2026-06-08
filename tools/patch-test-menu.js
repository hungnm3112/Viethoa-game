import fs from "node:fs";
import path from "node:path";

const inputFile = "input/gamedata/languages/embeddedstrings.xml";
const outputFile = "output/gamedata/languages/embeddedstrings.xml";

if (!fs.existsSync(inputFile)) {
  throw new Error(`Missing ${inputFile}. Run: npm run extract -- --group languages`);
}

const replacements = new Map([
  ["How to Play", "Cach choi"],
  ["Controls", "Dieu khien"],
  ["Game Settings", "Cai dat game"],
  ["Graphics Settings", "Cai dat do hoa"],
  ["Sound Settings", "Cai dat am thanh"],
  ["Help", "Tro giup"],
]);

let xml = fs.readFileSync(inputFile, "utf8");
for (const [source, target] of replacements) {
  xml = xml.replaceAll(source, target);
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, xml, "utf8");
console.log(`Wrote ${outputFile}`);
console.log("Next manual step: convert this XML to the game's required compiled format, then test loose-file override.");
