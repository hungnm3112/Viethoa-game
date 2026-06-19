import fs from 'node:fs';
import path from 'node:path';
import { replaceXmlStrings } from '../tools/lib/strings.js';

// Paths
const JOBS_DIR = 'jobs/reverted';
const MANIFEST_PATH = path.join(JOBS_DIR, 'manifest.json');
const ABBREV_TABLE_PATH = 'scripts/abbrev-table.json';
const OUTPUT_REPORT = 'output/reports/reverted-strings-fixed.xml';
const MANUAL_REVIEW_DIR = 'output/reports/manual-review';

// Load abbreviation table
const abbrevTable = JSON.parse(fs.readFileSync(ABBREV_TABLE_PATH, 'utf8'));

// Helper: remove diacritics (accents)
function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Helper: apply abbreviations (replace all occurrences)
function applyAbbrev(str) {
  let result = str;
  for (const [key, val] of Object.entries(abbrevTable)) {
    const regex = new RegExp(key, 'gi');
    result = result.replace(regex, val);
  }
  return result;
}

// Ensure manual review folder exists
if (!fs.existsSync(MANUAL_REVIEW_DIR)) {
  fs.mkdirSync(MANUAL_REVIEW_DIR, { recursive: true });
}

// Load manifest to know which job files exist
if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('Manifest not found. Did you run generate-revert-jobs.js?');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// Parse command‑line args to select jobs (e.g., --jobs 1,2,3)
const args = process.argv.slice(2);
let selectedJobIds = [];
for (const arg of args) {
  if (arg.startsWith('--jobs=')) {
    const ids = arg.split('=')[1].split(',').map(s => parseInt(s, 10));
    selectedJobIds.push(...ids);
  }
}
if (selectedJobIds.length === 0) {
  // default: process all jobs
  selectedJobIds = manifest.map(m => m.id);
}

let totalApplied = 0;
let totalHard = 0;
let xmlUpdates = {};

// Process each selected job
for (const jobId of selectedJobIds) {
  const jobInfo = manifest.find(m => m.id === jobId);
  if (!jobInfo) continue;
  const jobPath = jobInfo.file;
  const jobData = JSON.parse(fs.readFileSync(jobPath, 'utf8'));
  const hardList = [];

  for (const item of jobData) {
    const { orig, trans, origBytes } = item;
    // Step 1: try remove accents
    let candidate = removeAccents(trans);
    let candidateBytes = Buffer.byteLength(candidate, 'utf8');
    // Step 2: if still too long, apply abbreviations
    if (candidateBytes > origBytes) {
      candidate = applyAbbrev(candidate);
      candidateBytes = Buffer.byteLength(candidate, 'utf8');
    }
    // Step 3: if still too long -> manual review
    if (candidateBytes > origBytes) {
      hardList.push({ orig, trans, origBytes, afterAccents: candidate, afterAccentsBytes: candidateBytes });
      totalHard++;
      continue;
    }
    // Success – record replacement
    // Determine which output XML file the string belongs to (match original source path)
    // The job items originated from stubborn-strings.json which stored the output XML path.
    // For simplicity we embed the output path in the job item (add "file" field when generating jobs).
    // If missing, we fallback to a generic file placeholder.
    const srcFile = item.file || 'unknown';
    if (!xmlUpdates[srcFile]) xmlUpdates[srcFile] = {};
    xmlUpdates[srcFile][orig] = candidate;
    totalApplied++;
  }

  // Write manual review file if needed
  if (hardList.length > 0) {
    const manualPath = path.join(MANUAL_REVIEW_DIR, `manual-review-job${jobId}.json`);
    fs.writeFileSync(manualPath, JSON.stringify(hardList, null, 2), 'utf8');
    console.log(`Job ${jobId}: ${hardList.length} strings require manual review → ${manualPath}`);
  }
}

// Apply all collected replacements to their XML files
for (const [xmlPath, map] of Object.entries(xmlUpdates)) {
  if (!fs.existsSync(xmlPath)) {
    console.warn(`Output XML not found: ${xmlPath}`);
    continue;
  }
  const originalXml = fs.readFileSync(xmlPath, 'utf8');
  const patchedXml = replaceXmlStrings(originalXml, map);
  fs.writeFileSync(xmlPath, patchedXml, 'utf8');
  console.log(`Updated ${xmlPath} with ${Object.keys(map).length} strings`);
}

// Generate a combined report XML (simple format) for audit
let reportXml = '<?xml version="1.0" encoding="UTF-8"?>\n<revertedStringsFixed>\n';
for (const [xmlPath, map] of Object.entries(xmlUpdates)) {
  reportXml += `  <file path="${xmlPath}">\n`;
  for (const [src, dst] of Object.entries(map)) {
    const escapedSrc = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedDst = dst.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    reportXml += `    <string original="${escapedSrc}" translated="${escapedDst}"/>\n`;
  }
  reportXml += '  </file>\n';
}
reportXml += '</revertedStringsFixed>\n';
fs.writeFileSync(OUTPUT_REPORT, reportXml, 'utf8');

console.log('--- Summary ---');
console.log(`Total strings fixed (applied): ${totalApplied}`);
console.log(`Total strings requiring manual review: ${totalHard}`);
console.log(`Combined XML report written to ${OUTPUT_REPORT}`);
