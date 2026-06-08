import fs from "node:fs";
import path from "node:path";

const DEFAULT_SOURCE_FONT = "C:/Windows/Fonts/tahoma.ttf";
const OUTPUT_FILE = "output/gamedata/fonts/veramono.ttf";

const args = process.argv.slice(2);
const sourceFont =
  args.find((arg) => arg.startsWith("--source="))?.slice("--source=".length) ?? DEFAULT_SOURCE_FONT;

if (!fs.existsSync(sourceFont)) {
  throw new Error(`Source font not found: ${sourceFont}`);
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.copyFileSync(sourceFont, OUTPUT_FILE);

console.log(`Copied ${sourceFont} -> ${OUTPUT_FILE}`);
console.log("Copy this file to:");
console.log("D:\\SteamLibrary\\steamapps\\common\\State of Decay YOSE\\Game\\fonts\\veramono.ttf");
