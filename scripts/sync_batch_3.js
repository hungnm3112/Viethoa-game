import fs from 'fs';
import path from 'path';
import { extractXmlStrings, replaceXmlStrings } from '../tools/lib/strings.js';

const PENDING_FILE = path.resolve('jobs', 'pending.json');
const DONE_FILE = path.resolve('jobs', 'done.json');
const OUTPUT_BATCH_FILE = path.resolve('jobs', 'output_batch.json');
const INPUT_BATCH_FILE = path.resolve('jobs', 'input_batch.json');
const CACHE_FILE = path.resolve('cache', 'translations.json');

function syncBatch3() {
    if (!fs.existsSync(OUTPUT_BATCH_FILE)) {
        console.error('No jobs/output_batch.json found.');
        process.exit(1);
    }
    if (!fs.existsSync(PENDING_FILE)) {
        console.error('No jobs/pending.json found.');
        process.exit(1);
    }
    if (!fs.existsSync(DONE_FILE)) {
        console.error('No jobs/done.json found.');
        process.exit(1);
    }

    const outputBatch = JSON.parse(fs.readFileSync(OUTPUT_BATCH_FILE, 'utf8'));
    const pending = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
    const done = JSON.parse(fs.readFileSync(DONE_FILE, 'utf8'));

    let cache = {};
    if (fs.existsSync(CACHE_FILE)) {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }

    const batchIds = new Set(outputBatch.map(j => j.id));

    // 1. Move jobs from pending.json to done.json and update cache
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
            
            originalJob.translatedStrings = translated.strings.map(s => s.translation);
            
            // Push to done list if it's not already there (safety check)
            if (!done.some(d => d.id === originalJob.id)) {
                done.push(originalJob);
            }
            pending.splice(index, 1);
        }
    }

    // Save queues and cache
    fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2), 'utf8');
    fs.writeFileSync(DONE_FILE, JSON.stringify(done, null, 2), 'utf8');
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
    console.log('Updated cache, pending.json, and done.json.');

    // 2. Build translations map from cache for replacing XML strings
    const cacheMap = new Map();
    for (const [source, val] of Object.entries(cache)) {
        cacheMap.set(source, val.t);
    }

    // 3. For each job in the done list that is in Batch 3, regenerate the XML output file
    for (const job of done) {
        if (!batchIds.has(job.id)) {
            continue;
        }
        
        const inputPath = path.resolve(job.inputFile);
        const outputPath = path.resolve(job.outputFile);
        
        if (!fs.existsSync(inputPath)) {
            console.warn(`Input file ${inputPath} not found for job ${job.id}`);
            continue;
        }

        console.log(`Regenerating XML output for job ${job.id}: ${job.inputFile} -> ${job.outputFile}`);
        const xml = fs.readFileSync(inputPath, 'utf8');
        
        // Extract original XML strings and look up translations in our cacheMap
        const translations = new Map();
        const extracted = extractXmlStrings(xml);
        for (const item of extracted) {
            const translatedVal = cacheMap.get(item.value);
            if (translatedVal) {
                translations.set(item.value, translatedVal);
            }
        }

        const outputXml = replaceXmlStrings(xml, translations);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, outputXml, 'utf8');
    }

    // 4. Clean up batch files
    if (fs.existsSync(OUTPUT_BATCH_FILE)) {
        fs.unlinkSync(OUTPUT_BATCH_FILE);
        console.log(`Deleted ${OUTPUT_BATCH_FILE}`);
    }
    if (fs.existsSync(INPUT_BATCH_FILE)) {
        fs.unlinkSync(INPUT_BATCH_FILE);
        console.log(`Deleted ${INPUT_BATCH_FILE}`);
    }

    console.log('Batch 3 synchronization and XML output regeneration complete!');
}

syncBatch3();
