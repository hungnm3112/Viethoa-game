import fs from "node:fs";
import path from "node:path";

const inputFile = "input/gamedata/languages/embeddedstrings.xml";
const outputFile = "output/gamedata/languages/embeddedstrings.xml";

if (!fs.existsSync(inputFile)) {
  throw new Error(`Missing ${inputFile}. Run: npm run extract -- --group languages`);
}

const replacements = new Map([
  ["How to Play", "Cách chơi"],
  ["Controls", "Điều khiển"],
  ["Game Settings", "Cài đặt game"],
  ["Graphics Settings", "Cài đặt đồ họa"],
  ["Sound Settings", "Cài đặt âm thanh"],
  ["Help", "Trợ giúp"],
]);

let xml = fs.readFileSync(inputFile, "utf8");
for (const [source, target] of replacements) {
  xml = xml.replaceAll(source, target);
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, xml, "utf8");
console.log(`Wrote ${outputFile}`);
console.log("Next manual step: convert this XML to the game's required compiled format, then test loose-file override.");
