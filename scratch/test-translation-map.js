import fs from 'fs';
import { extractXmlStringOccurrences, looksTranslatable, normalizeText } from '../tools/lib/strings.js';

const srcXml = fs.readFileSync('input/gamedata/libs/class3/items/items.xml', 'utf8');
const tgtXml = fs.readFileSync('output/gamedata/libs/class3/items/items.xml', 'utf8');
const src = extractXmlStringOccurrences(srcXml);
const tgt = extractXmlStringOccurrences(tgtXml);

for (let i = 0; i < Math.min(src.length, tgt.length); i++) {
  if (src[i].value.includes('Mk.16 Mod.0')) {
    console.log("Found:", src[i].value, "=>", tgt[i].value);
    console.log("Translatable?", looksTranslatable(src[i].value));
    console.log("Different?", normalizeText(src[i].value) !== normalizeText(tgt[i].value));
  }
}
