import fs from 'fs';
import path from 'path';

const PENDING_FILE = path.resolve('jobs', 'pending.json');
const INPUT_BATCH_FILE = path.resolve('jobs', 'input_batch.json');
const BATCH_SIZE = 10;

function utf8ByteLength(value) {
    return Buffer.byteLength(String(value ?? ""), "utf8");
}

function pullBatch() {
    if (!fs.existsSync(PENDING_FILE)) {
        console.error('No pending.json found.');
        return;
    }

    const pending = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
    
    if (pending.length === 0) {
        console.log('No pending jobs left.');
        fs.writeFileSync(INPUT_BATCH_FILE, JSON.stringify([], null, 2));
        return;
    }

    const batch = pending.slice(0, BATCH_SIZE);
    
    const agentInput = batch.map(job => {
        return {
            id: job.id,
            group: job.group,
            strings: job.strings.map(text => ({
                source: text,
                maxUtf8Bytes: utf8ByteLength(text)
            }))
        };
    });

    fs.writeFileSync(INPUT_BATCH_FILE, JSON.stringify(agentInput, null, 2));
    console.log(`Pulled ${batch.length} jobs to input_batch.json`);
    console.log(`Remaining in pending.json: ${pending.length - batch.length}`);
}

pullBatch();
