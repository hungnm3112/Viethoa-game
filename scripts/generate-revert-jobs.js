import fs from 'node:fs';
import path from 'node:path';

const INPUT_FILE = 'output/reports/stubborn-strings.json';
const JOBS_DIR = 'jobs/reverted';
const MANIFEST_FILE = path.join(JOBS_DIR, 'manifest.json');
const JOB_COUNT = 5;

if (!fs.existsSync(INPUT_FILE)) {
  console.error(`Input file not found: ${INPUT_FILE}`);
  process.exit(1);
}

const allStrings = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
const perJob = Math.ceil(allStrings.length / JOB_COUNT);

fs.mkdirSync(JOBS_DIR, { recursive: true });

const manifest = [];
for (let i = 0; i < JOB_COUNT; i++) {
  const start = i * perJob;
  const end = Math.min(start + perJob, allStrings.length);
  const chunk = allStrings.slice(start, end);
  const jobFile = path.join(JOBS_DIR, `job-${i + 1}.json`);
  fs.writeFileSync(jobFile, JSON.stringify(chunk, null, 2));
  manifest.push({ id: i + 1, file: jobFile, count: chunk.length });
  console.log(`Created ${jobFile} with ${chunk.length} strings`);
}

fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
console.log(`Manifest written to ${MANIFEST_FILE}`);
