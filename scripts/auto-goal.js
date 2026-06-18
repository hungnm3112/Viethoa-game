import fs from 'fs';
import path from 'path';
import https from 'https';

const PENDING_FILE = path.resolve('jobs', 'pending.json');
const DONE_FILE = path.resolve('jobs', 'done.json');
const CACHE_FILE = path.resolve('cache', 'translations.json');

const BATCH_SIZE = 10;

function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

function utf8ByteLength(value) {
    return Buffer.byteLength(String(value ?? ""), "utf8");
}

async function translateText(text) {
    // Extract placeholders
    const regex = /(\{\d+\}|%[0-9\$]*[sd]|\n|##|<[^>]+>|\[[^\]]+\])/g;
    let i = 0;
    const map = {};
    const replacedText = text.replace(regex, m => {
        const key = `__P_${i}__`;
        map[key] = m;
        i++;
        return key;
    });

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(replacedText)}`;
    
    let result = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                } else {
                    resolve(JSON.parse(data));
                }
            });
        }).on('error', reject);
    });

    let translatedReplaced = result[0].map(x => x[0]).join('');
    
    // Restore placeholders
    let finalTranslated = translatedReplaced;
    for (const [key, val] of Object.entries(map)) {
        // Sometimes Google translate adds spaces around the placeholder
        const keyRegex = new RegExp(`\\s*${key}\\s*`, 'g');
        finalTranslated = finalTranslated.replace(keyRegex, val);
    }

    return finalTranslated;
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function runAutoGoal() {
    console.log("Starting Auto-Goal Translation...");

    let pending = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
    let done = fs.existsSync(DONE_FILE) ? JSON.parse(fs.readFileSync(DONE_FILE, 'utf8')) : [];
    let cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};

    while (pending.length > 0) {
        const batch = pending.slice(0, BATCH_SIZE);
        let batchTranslatedCount = 0;
        
        for (const job of batch) {
            console.log(`Processing Job ${job.id}...`);
            const translatedStrings = [];
            
            for (const text of job.strings) {
                let translatedStr = "";
                // Check cache
                if (cache[text] && cache[text].t) {
                    translatedStr = cache[text].t;
                } else {
                    let success = false;
                    let retries = 3;
                    while (!success && retries > 0) {
                        try {
                            let translatedRaw = await translateText(text);
                            
                            // Normalize length
                            const maxBytes = utf8ByteLength(text);
                            let currentBytes = utf8ByteLength(translatedRaw);
                            if (currentBytes > maxBytes) {
                                let noDiacritics = removeDiacritics(translatedRaw);
                                if (utf8ByteLength(noDiacritics) <= maxBytes) {
                                    translatedRaw = noDiacritics;
                                } else {
                                    let buf = Buffer.from(noDiacritics, 'utf8');
                                    let truncated = buf.slice(0, maxBytes).toString('utf8');
                                    truncated = truncated.replace(/\ufffd/g, '');
                                    translatedRaw = truncated;
                                }
                            }

                            cache[text] = {
                                t: translatedRaw,
                                v: "1.0.0",
                                d: new Date().toISOString()
                            };
                            translatedStr = translatedRaw;
                            success = true;
                            batchTranslatedCount++;
                            await delay(300); // Wait 300ms between Google API requests
                        } catch (err) {
                            console.error(`Error translating: ${err.message}. Retrying...`);
                            retries--;
                            await delay(5000);
                        }
                    }
                    if (!success) {
                        console.error(`Failed to translate string in Job ${job.id} after retries.`);
                        translatedStr = text; // Fallback to original
                    }
                }
                translatedStrings.push(translatedStr);
            }
            
            job.translatedStrings = translatedStrings;
            done.push(job);
        }

        pending = pending.slice(BATCH_SIZE);
        fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));
        fs.writeFileSync(DONE_FILE, JSON.stringify(done, null, 2));
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
        
        console.log(`Batch finished. Saved to disk. Remaining jobs: ${pending.length}`);
    }

    console.log("All jobs finished! /goal achieved.");
}

runAutoGoal().catch(console.error);
