import fs from 'fs';
import path from 'path';

const PENDING_FILE = path.resolve('jobs', 'pending.json');
const DONE_FILE = path.resolve('jobs', 'done.json');
const CACHE_FILE = path.resolve('cache', 'translations.json');
const INPUT_BATCH_FILE = path.resolve('jobs', 'input_batch.json');
const OUTPUT_BATCH_FILE = path.resolve('jobs', 'output_batch.json');

function resetQueue() {
    let done = [];
    if (fs.existsSync(DONE_FILE)) {
        done = JSON.parse(fs.readFileSync(DONE_FILE, 'utf8'));
    }

    let pending = [];
    if (fs.existsSync(PENDING_FILE)) {
        pending = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
    }

    // Combine all jobs
    const allJobsMap = new Map();

    // Process done jobs first (stripping out translation metadata to restore them as fresh pending jobs)
    for (const job of done) {
        allJobsMap.set(job.id, {
            id: job.id,
            group: job.group,
            inputFile: job.inputFile,
            outputFile: job.outputFile,
            totalStringsInFile: job.totalStringsInFile,
            untranslatedStringsInFile: job.untranslatedStringsInFile,
            strings: job.strings
        });
    }

    // Process existing pending jobs
    for (const job of pending) {
        allJobsMap.set(job.id, {
            id: job.id,
            group: job.group,
            inputFile: job.inputFile,
            outputFile: job.outputFile,
            totalStringsInFile: job.totalStringsInFile,
            untranslatedStringsInFile: job.untranslatedStringsInFile,
            strings: job.strings
        });
    }

    // Sort jobs by ID ascending
    const sortedJobs = Array.from(allJobsMap.values()).sort((a, b) => a.id.localeCompare(b.id));

    // Write all jobs to pending.json
    fs.writeFileSync(PENDING_FILE, JSON.stringify(sortedJobs, null, 2));

    // Clear done.json
    fs.writeFileSync(DONE_FILE, JSON.stringify([], null, 2));

    // Clear translations cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify({}, null, 2));

    // Clean up temporary batch files
    if (fs.existsSync(INPUT_BATCH_FILE)) fs.unlinkSync(INPUT_BATCH_FILE);
    if (fs.existsSync(OUTPUT_BATCH_FILE)) fs.unlinkSync(OUTPUT_BATCH_FILE);

    console.log(`Reset completed!`);
    console.log(`Total jobs restored to pending.json: ${sortedJobs.length}`);
    console.log(`First job ID: ${sortedJobs[0]?.id}`);
}

resetQueue();
