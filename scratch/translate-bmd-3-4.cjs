const fs = require('fs');
const path = require('path');

const bmdMap = {
  // BMD 3
  "Shotgun_Russian 12K": "Súng SG Russian 12K",

  // BMD 4
  "Baton Cop": "Dùi Cui Cảnh Sát",
  "Firemans Axe": "Rìu Cứu Hỏa",
  "Waki Short": "Kiếm Ngắn Wakizashi",
  "Bat Cricket": "Gậy Cricket",
  "Pipe Threader": "Ống Thép Tiện",
  "Shotgun Shells": "Đạn Súng SG",
  "For shotguns.": "Dùng cho súng shotgun.",
  "Incendiary Shotgun Shells": "Đạn Súng SG Cháy",
  "Incendiary ammo for compatible shotguns.": "Đạn cháy dùng cho các súng shotgun tương thích.",
  "Grenade Launcher Ammo": "Đạn Súng Phóng Lựu",
  "For grenade launchers. Obviously.": "Dùng cho súng phóng lựu. Rõ ràng rồi.",
  "9 mm": "Đạn 9mm",
  "Small-caliber rounds for pistols, revolvers and rifles.": "Đạn cỡ nhỏ dùng cho súng lục, rulo và súng trường.",
  ".22 caliber": "Đạn .22",
  "Small-caliber rounds for pistols, revolvers, rifles, and SMGs.": "Đạn cỡ nhỏ dùng cho súng lục, rulo, súng trường và SMG.",
  ".357 caliber": "Đạn .357",
  "Powerful round for revolvers and some rifles.": "Loại đạn mạnh dùng cho rulo và một số súng trường.",
  ".40 caliber": "Đạn .40",
  "Mid-range round for pistols and some submachineguns.": "Đạn tầm trung dùng cho súng lục và một số súng tiểu liên.",
  ".44 caliber": "Đạn .44",
  "Powerful round primarily for revolvers and some rifles.": "Loại đạn mạnh chủ yếu dùng cho rulo và một số súng trường.",
  ".45 caliber": "Đạn .45",
  "Powerful mid-range workhorse for pistols, some revolvers and rifles.": "Đạn đáng tin cậy dùng cho súng lục, một số rulo và súng trường.",
  ".50 caliber": "Đạn .50",
  "Very powerful round for large frame revolvers, pistols and long range rifles.": "Loại đạn rất mạnh dùng cho rulo cỡ lớn, súng lục và súng bắn tỉa.",
  "5.56mm ": "Đạn 5.56mm",
  "Standard NATO battle rifle caliber, includes the .223 caliber family of rounds as well.": "Đạn tiêu chuẩn NATO cho súng trường chiến đấu, bao gồm cả dòng đạn .223.",
  "7.62mm ": "Đạn 7.62mm",
  "Powerful round used the world over. Includes the entirety of the thirty-caliber family of rifle ammunition. Used by battle rifles and long-range rifles.": "Loại đạn mạnh được dùng trên toàn thế giới. Dùng cho súng trường chiến đấu và bắn tỉa.",
  "Small Backpack": "Balo Nhỏ",
  "Traveling light is good, but having what you need is better.": "Di chuyển gọn nhẹ thì tốt, nhưng có đủ thứ mình cần thì tốt hơn.",
  "Medium Pack": "Balo Vừa",
  "Large Backpack": "Balo Lớn"
};

function translateBmdChunks() {
  const bmdFiles = ['bmd_chunk_3.json', 'bmd_chunk_4.json'];
  
  for (const file of bmdFiles) {
    const filePath = path.join(__dirname, '../input/languages/bmd_chunks', file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file} - not found`);
      continue;
    }
    
    const chunk = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let translatedCount = 0;
    
    for (const item of chunk.replacements) {
      if (bmdMap[item.sourceText]) {
        item.translatedText = bmdMap[item.sourceText];
        translatedCount++;
      } else {
        // Just copy over system strings and numbers
        if (!item.sourceText.match(/[a-zA-Z]/) || item.sourceText.includes("sounds/ui")) {
          item.translatedText = item.sourceText;
        } else {
          item.translatedText = item.sourceText;
        }
      }
    }
    
    const outPath = path.join(__dirname, '../output/languages/bmd_chunks');
    fs.mkdirSync(outPath, { recursive: true });
    fs.writeFileSync(path.join(outPath, file), JSON.stringify(chunk, null, 2));
    console.log(`Translated ${translatedCount} strings in ${file}`);
  }
}

translateBmdChunks();
console.log("Done BMD 3 and 4.");
