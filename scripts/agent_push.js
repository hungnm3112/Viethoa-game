import fs from 'fs';
import path from 'path';

const PENDING_FILE = path.resolve('jobs', 'pending.json');
const DONE_FILE = path.resolve('jobs', 'done.json');
const OUTPUT_BATCH_FILE = path.resolve('jobs', 'output_batch.json');
const CACHE_FILE = path.resolve('cache', 'translations.json');

function utf8ByteLength(value) {
    return Buffer.byteLength(String(value ?? ""), "utf8");
}

function placeholdersMatch(source, translated) {
    const extractPlaceholders = (text) => {
        const tokens = [];
        // Match {0}, %s, %d, %1$s, ##, \n, <tag>, [tag]
        const regex = /(\{\d+\}|%[0-9\$]*[sd]|\n|##|<[^>]+>|\[[^\]]+\])/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            tokens.push(match[0]);
        }
        return tokens.sort();
    };
    const srcTokens = extractPlaceholders(source);
    const dstTokens = extractPlaceholders(translated);
    if (srcTokens.length !== dstTokens.length) return false;
    for (let i = 0; i < srcTokens.length; i++) {
        if (srcTokens[i] !== dstTokens[i]) return false;
    }
    return true;
}

function pushBatch() {
    if (!fs.existsSync(OUTPUT_BATCH_FILE)) {
        console.error('No output_batch.json found. AI needs to generate this first.');
        return;
    }

    const outputBatch = JSON.parse(fs.readFileSync(OUTPUT_BATCH_FILE, 'utf8'));
    const pending = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
    let done = [];
    if (fs.existsSync(DONE_FILE)) {
        done = JSON.parse(fs.readFileSync(DONE_FILE, 'utf8'));
    }
    let cache = {};
    if (fs.existsSync(CACHE_FILE)) {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }

    let hasError = false;
    
    // Validate first
    for (const job of outputBatch) {
        for (const item of job.strings) {
            const sourceBytes = utf8ByteLength(item.source);
            const translatedBytes = utf8ByteLength(item.translation);
            
            if (translatedBytes > sourceBytes) {
                console.error(`[ERROR] Job ${job.id}: Translation too long!`);
                console.error(`Source (${sourceBytes} bytes): ${item.source}`);
                console.error(`Translation (${translatedBytes} bytes): ${item.translation}`);
                hasError = true;
            }
            
            if (!placeholdersMatch(item.source, item.translation)) {
                console.error(`[ERROR] Job ${job.id}: Placeholders mismatch!`);
                console.error(`Source: ${item.source}`);
                console.error(`Translation: ${item.translation}`);
                hasError = true;
            }
        }
    }

    if (hasError) {
        console.error("Validation failed. Fix output_batch.json and try again.");
        process.exit(1);
    }

    // Apply
    for (const translated of outputBatch) {
        const index = pending.findIndex(p => p.id === translated.id);
        if (index !== -1) {
            const originalJob = pending[index];
            // Update cache
            for (const item of translated.strings) {
                cache[item.source] = {
                    t: item.translation,
                    v: "1.0.0",
                    d: new Date().toISOString()
                };
            }
            
            // Note: we don't need to put translatedStrings into job if translate.js just uses cache.
            // But we will add it to done just in case.
            originalJob.translatedStrings = translated.strings.map(s => s.translation);
            
            done.push(originalJob);
            pending.splice(index, 1);
        }
    }

    fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));
    fs.writeFileSync(DONE_FILE, JSON.stringify(done, null, 2));
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    
    // Clean up
    fs.unlinkSync(OUTPUT_BATCH_FILE);
    const inputBatchFile = path.resolve('jobs', 'input_batch.json');
    if (fs.existsSync(inputBatchFile)) fs.unlinkSync(inputBatchFile);

    console.log(`Successfully pushed ${outputBatch.length} translated jobs.`);
    console.log(`Remaining in pending.json: ${pending.length}`);
}

pushBatch();
