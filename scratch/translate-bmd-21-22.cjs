const fs = require('fs');

const map = {
  // Chunk 21
  "Dr. Nancy": "Bác Sĩ Nancy",

  // Chunk 22
  "Captain Moustache": "Đội Trưởng Râu Kẽm",
  "SWAT Officer": "Sĩ Quan SWAT",
  "Pfc. Winters": "Binh Nhất Winters",
  "Sgt. Erik Tan": "Trung Sĩ Erik Tan",
  "Captain Montressor": "Đại Úy Montressor"
};

function applyTranslations(chunkPath, mapData) {
  if (!fs.existsSync(chunkPath)) return;
  const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  for (const r of chunk.replacements) {
    if (r.sourceText.includes('Trait.Voice.') || r.sourceText.includes('Trait.Story.') || r.sourceText.includes('Trait.Job.') || r.sourceText.includes('Trait.Personality.') || r.sourceText.includes('Trait.Mood.') || r.sourceText.includes('Trait.Hobby.') || r.sourceText.includes('Trait.Talent.') || r.sourceText.includes('Trait.History.') || r.sourceText.includes('Trait.Immune.') || r.sourceText.includes('Trait.Behavior.') || r.sourceText.includes('Trait.Meta.') || r.sourceText.includes('Trait.Status.') || r.sourceText.includes('Trait.Merc.') || r.sourceText.includes('Trait.Debug.')) {
      continue;
    }
    if (mapData[r.sourceText]) {
      r.translatedText = mapData[r.sourceText];
    }
  }
  fs.mkdirSync('output/languages/bmd_chunks', { recursive: true });
  fs.writeFileSync(chunkPath.replace('input/languages/', 'output/languages/'), JSON.stringify(chunk, null, 2), 'utf8');
}

applyTranslations('input/languages/bmd_chunks/bmd_chunk_21.json', map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_22.json', map);
console.log('Translated BMD Chunk 21 and 22 successfully!');
