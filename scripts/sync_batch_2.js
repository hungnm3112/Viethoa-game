import fs from 'fs';
import path from 'path';
import { extractXmlStrings, replaceXmlStrings } from '../tools/lib/strings.js';

const PENDING_FILE = path.resolve('jobs', 'pending.json');
const DONE_FILE = path.resolve('jobs', 'done.json');
const OUTPUT_BATCH_FILE = path.resolve('jobs', 'output_batch.json');
const INPUT_BATCH_FILE = path.resolve('jobs', 'input_batch.json');
const CACHE_FILE = path.resolve('cache', 'translations.json');

function syncBatch2() {
    if (!fs.existsSync(OUTPUT_BATCH_FILE)) {
        console.error('No jobs/output_batch.json found.');
        process.exit(1);
    }
    if (!fs.existsSync(DONE_FILE)) {
        console.error('No jobs/done.json found.');
        process.exit(1);
    }

    const outputBatch = JSON.parse(fs.readFileSync(OUTPUT_BATCH_FILE, 'utf8'));
    const doneJobs = JSON.parse(fs.readFileSync(DONE_FILE, 'utf8'));

    let cache = {};
    if (fs.existsSync(CACHE_FILE)) {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }

    // 1. Update cache with Batch 2 translations
    const batchTranslations = new Map();
    for (const job of outputBatch) {
        for (const item of job.strings) {
            cache[item.source] = {
                t: item.translation,
                v: "1.0.0",
                d: new Date().toISOString()
            };
            batchTranslations.set(item.source, item.translation);
        }
    }

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
    console.log(`Updated cache file: ${CACHE_FILE}`);

    // 2. Build translations map from cache to pass to replaceXmlStrings
    const cacheMap = new Map();
    for (const [source, val] of Object.entries(cache)) {
        cacheMap.set(source, val.t);
    }

    // 3. For each job in doneJobs that matches Batch 2 (00011 to 00020), regenerate the XML output file
    const batchIds = new Set(outputBatch.map(j => j.id));
    
    for (const job of doneJobs) {
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

    console.log('Batch 2 synchronization and output regeneration complete!');
}

syncBatch2();
