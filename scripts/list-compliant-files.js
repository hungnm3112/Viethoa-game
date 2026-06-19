import fs from "node:fs";
import path from "node:path";

function findXmlFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findXmlFiles(fullPath));
    } else if (entry.name.toLowerCase().endsWith(".xml")) {
      results.push(fullPath);
    }
  }
  return results;
}

function decodeXml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");
}

function extractXmlStringOccurrences(xml) {
  const results = [];
  for (const match of xml.matchAll(/<Data\b[^>]*>([^<]*)<\/Data>/gim)) {
    results.push(decodeXml(match[1]));
  }
  for (const match of xml.matchAll(/([A-Za-z_:.-]*(?:text|title|label|name|desc|description|summary|caption|hint|message)[A-Za-z_:.-]*)\s*=\s*(["'])(.*?)\2/gims)) {
    results.push(decodeXml(match[3]));
  }
  return results;
}

function normalizeText(text) {
  return text.trim().replace(/\r\n/g, "\n");
}

const outputDir = "output/gamedata";
const inputDir = "input/gamedata";

const outputXmlFiles = findXmlFiles(outputDir);
const compliantFiles = [];
const nonCompliantFiles = [];
const untouchedFiles = [];

for (const outPath of outputXmlFiles) {
  const relPath = path.relative(outputDir, outPath);
  const inPath = path.join(inputDir, relPath);
  
  if (!fs.existsSync(inPath)) continue;
  
  const inXml = fs.readFileSync(inPath, "utf8");
  const outXml = fs.readFileSync(outPath, "utf8");
  
  const inStrs = extractXmlStringOccurrences(inXml);
  const outStrs = extractXmlStringOccurrences(outXml);
  
  const count = Math.min(inStrs.length, outStrs.length);
  let translatedCount = 0;
  let oversizedCount = 0;
  
  for (let i = 0; i < count; i++) {
    const orig = inStrs[i];
    const trans = outStrs[i];
    
    if (!orig || !trans) continue;
    if (normalizeText(orig) === normalizeText(trans)) continue; 
    
    translatedCount++;
    const origBytes = Buffer.byteLength(orig, "utf8");
    const transBytes = Buffer.byteLength(trans, "utf8");
    
    if (transBytes > origBytes) {
      oversizedCount++;
    }
  }
  
  if (translatedCount === 0) {
    untouchedFiles.push(relPath);
  } else if (oversizedCount === 0) {
    compliantFiles.push({ file: relPath, translated: translatedCount });
  } else {
    nonCompliantFiles.push({ file: relPath, translated: translatedCount, oversized: oversizedCount });
  }
}

console.log("=== FILE DỊCH ĐÃ ĐẠT CHUẨN (0 lỗi vượt byte) ===");
if (compliantFiles.length === 0) {
  console.log("Không có file nào đạt chuẩn hoàn toàn.");
} else {
  for (const f of compliantFiles) {
    console.log(`- ${f.file.replace(/\\/g, '/')} (${f.translated} câu dịch)`);
  }
}

console.log("\n=== FILE DỊCH CHƯA ĐẠT CHUẨN ===");
for (const f of nonCompliantFiles) {
  console.log(`- ${f.file.replace(/\\/g, '/')} (Lỗi ${f.oversized}/${f.translated} câu)`);
}
