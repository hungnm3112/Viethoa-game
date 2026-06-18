import fs from 'fs';
import path from 'path';

function utf8ByteLength(value) {
    return Buffer.byteLength(String(value ?? ""), "utf8");
}

const INPUT_FILE = path.resolve('jobs', 'input_batch.json');
const OUTPUT_FILE = path.resolve('jobs', 'output_batch.json');

if (!fs.existsSync(INPUT_FILE) || !fs.existsSync(OUTPUT_FILE)) {
    console.error("Missing input_batch.json or output_batch.json");
    process.exit(1);
}

const inputs = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
const outputs = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));

let overLimitCount = 0;

console.log("--- BATCH VALIDATION REPORT ---");
for (const outJob of outputs) {
    const inJob = inputs.find(j => j.id === outJob.id);
    if (!inJob) continue;

    for (let i = 0; i < outJob.strings.length; i++) {
        const outStr = outJob.strings[i];
        const inStr = inJob.strings.find(s => s.source === outStr.source);
        if (!inStr) continue;

        const limit = inStr.maxUtf8Bytes;
        const len = utf8ByteLength(outStr.translation);
        const diff = len - limit;

        if (diff > 0) {
            console.log(`[OVER] Job ${outJob.id}: +${diff} bytes (Length: ${len}, Limit: ${limit})`);
            console.log(`  Src: "${inStr.source.substring(0, 80)}"`);
            console.log(`  Trs: "${outStr.translation.substring(0, 80)}"`);
            overLimitCount++;
        }
    }
}

console.log(`\nTotal strings over budget: ${overLimitCount}`);
