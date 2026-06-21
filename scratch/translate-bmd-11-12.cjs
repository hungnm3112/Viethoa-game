const fs = require('fs');

const map = {
  // Chunk 11
  "Royal Igorot Axe": "Rìu Hoàng Gia Igorot",
  "A high quality antique headhunting axe.": "Rìu săn đầu người cổ đại chất lượng cao.",
  "Heavy Kanabo": "Chùy Kanabo Hạng Nặng",
  "Splitting Maul": "Búa Bổ Củi",
  "For splitting wood and zed heads.": "Dùng để chẻ củi và bổ đầu lũ xác sống (Zed).",
  "Bike Polo Mallet": "Gậy Đánh Bóng Chày Polo",
  "Extreme sports, indeed!": "Đúng là môn thể thao cảm giác mạnh!",
  "Juggling Baton": "Dùi Cui Tung Hứng",
  "Well, you use what you can...": "Chà, có gì dùng nấy thôi...",
  "Swing Training Bat": "Gậy Bóng Chày Tập Vung",
  "Strength Training Bat": "Gậy Bóng Chày Tập Lực",
  "Swing from the hips!": "Đánh từ hông lên nhé!",
  "Bench Barbell": "Đòn Tạ Đẩy Băng Ghế",
  "Beefcake!": "Cơ bắp cuồn cuộn!",
  "Curl Bar": "Đòn Tạ Chữ Z",
  "Pump you up!": "Bơm cơ lên nào!",
  "Firefighter's Universal Tool": "Dụng Cụ Đa Năng Của Lính Cứu Hỏa",
  "Think of it as a big heavy key.": "Cứ coi nó như một cái chìa khóa to và nặng đi.",
  "Pry Knife": "Dao Cạy",
  "Helps firefighters gain some leverage.": "Giúp lính cứu hỏa có thêm điểm tựa để nạy cửa.",
  "Trusty Fire Axe": "Rìu Cứu Hỏa Đáng Tin Cậy",
  "Fight fire with steel.": "Lấy thép trị lửa.",
  "Access Axe": "Rìu Phá Cửa",
  "A handy demolition tool.": "Công cụ phá dỡ tiện lợi.",
  "Firefighter's Brush Hook": "Móc Phá Bụi Rậm Cứu Hỏa",
  "Knock down burning stuff.": "Giật sập những thứ đang bốc cháy.",
  "Fire Access Tool": "Dụng Cụ Mở Đường Cứu Hỏa",
  "A heavy access tool.": "Một công cụ hạng nặng để mở đường.",
  "CLEO Wrecker": "Búa Đập Đá CLEO",
  "I'm gonna wreck it!": "Ta sẽ đập nát nó!",
  "CLEO Trench Tool": "Xẻng Chiến Hào CLEO",
  "Dig into some Zombie skulls.": "Xúc tung sọ lũ Xác sống lên.",
  "CLEO Machete": "Mã Tấu CLEO",
  "A simple blade with a single purpose.": "Một lưỡi dao đơn giản với mục đích duy nhất.",
  "CLEO Cra-B": "Dụng Cụ Phá Sọ CLEO Cra-B",
  "CRAnial Breacher by CLEO.": "Công cụ phá hộp sọ cực mạnh đến từ CLEO.",
  "CLEO Axe": "Rìu CLEO",
  "Next generation axe technology by CLEO.": "Công nghệ rìu thế hệ mới của CLEO.",
  "Buzzball Bat": "Gậy Đánh Bóng Chày Gắn Cưa",
  "Necessity, the mother of invention.": "Cái khó ló cái khôn.",
  "Plumbing Pipe": "Ống Nước Bằng Sắt",
  "Fixes leaks, or creates them!": "Sửa ống nước rò rỉ, hoặc tạo ra lỗ rò (trên sọ)!",
  "Ice Axe": "Rìu Băng",
  "A chilling weapon.": "Một loại vũ khí ớn lạnh.",
  "A popular sword from the Indian subcontinent.": "Thanh kiếm nổi tiếng từ tiểu lục địa Ấn Độ.",
  "An ancient Indian sword design.": "Thiết kế kiếm cổ của Ấn Độ.",
  "Viking Sword": "Kiếm Viking",
  "A replica of the famous Ulfberht swords.": "Bản sao của thanh kiếm Ulfberht huyền thoại.",
  "Vampyr Slayer": "Kẻ Diệt Ma Cà Rồng",
  "A requirement for any Day-Walker.": "Món đồ bắt buộc phải có cho mọi hiệp sĩ dạo bước ban ngày.",
  "Wolf Sword": "Kiếm Sói",
  "Replica of a popular TV show.": "Bản sao từ một chương trình TV nổi tiếng.",
  "Spartan Sword": "Kiếm Spartan",
  "This is ... a Spartan Sword!": "Đây là ... một thanh Kiếm Spartan!",
  "Orc Sword": "Kiếm Orc",
  "Crude, effective movie replica.": "Bản sao đạo cụ phim: thô kệch nhưng cực kỳ hiệu quả.",
  "A well crafted movie replica sword.": "Bản sao thanh kiếm trong phim được chế tác tỉ mỉ.",
  "Folding Hatchet": "Rìu Gập",
  "A rather flimsy but space-saving axe.": "Một cái rìu khá mỏng manh nhưng được cái tiết kiệm không gian.",
  "Light Brown": "Nâu Nhạt",
  "Dark Brown": "Nâu Đậm",
  "Medium Brown": "Nâu Vừa",
  "Dirty Blonde": "Vàng Khói",
  "White Gold": "Vàng Trắng"
};

function applyTranslations(chunkPath, mapData) {
  if (!fs.existsSync(chunkPath)) return;
  const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  for (const r of chunk.replacements) {
    if (mapData[r.sourceText]) {
      r.translatedText = mapData[r.sourceText];
    }
  }
  fs.mkdirSync('output/languages/bmd_chunks', { recursive: true });
  fs.writeFileSync(chunkPath.replace('input/languages/', 'output/languages/'), JSON.stringify(chunk, null, 2), 'utf8');
}

applyTranslations('input/languages/bmd_chunks/bmd_chunk_11.json', map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_12.json', map);

console.log('Translated BMD Chunk 11 and 12 successfully!');
