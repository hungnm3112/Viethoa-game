const fs = require('fs');

const map = {
  // Chunk 38
  "Coordinating everything by radio.": "Điều phối mọi thứ qua radio.",
  "Radio Operator: %s": "Người Trực Radio: %s",
  "Command Center: Food Located": "Trung Tâm Chỉ Huy: Đã Tìm Thấy Lương Thực",
  "Command Center: Medicine Located": "Trung Tâm Chỉ Huy: Đã Tìm Thấy Thuốc Men",
  "Command Center: Ammo Located": "Trung Tâm Chỉ Huy: Đã Tìm Thấy Đạn Dược",
  "Command Center: Materials Located": "Trung Tâm Chỉ Huy: Đã Tìm Thấy Vật Liệu",
  "Command Center: Fuel Located": "Trung Tâm Chỉ Huy: Đã Tìm Thấy Nhiên Liệu",
  "BUILT: Basic Workshop": "ĐÃ XÂY: Xưởng Cơ Bản",
  "%+d Community Fame": "%+d Danh Tiếng Cộng Đồng",
  "Everyone knows this was a good move. The community feels a little more organized.": "Tất cả mọi người đều biết đây là một nước cờ hay. Cả cộng đồng cảm thấy có tổ chức hơn một chút.",
  "Problem Solved": "Vấn Đề Đã Được Giải Quyết",
  "Needs Tools Expert.": "Cần Chuyên Gia Máy Móc.",
  "Knows a little something about tools and construction.": "Biết chút ít về máy móc và xây dựng.",
  "Tools Expert: %s": "Chuyên Gia Máy Móc: %s",
  "Homemade Suppressor": "Nòng Giảm Thanh Tự Chế",
  "HOME: Action Complete": "CĂN CỨ: Đã Hoàn Thành Hành Động",
  "UPGRADED: Workshop": "ĐÃ NÂNG CẤP: Xưởng Chế Tạo",
  "Need Tools Expert.": "Cần Chuyên Gia Máy Móc.",
  "UPGRADED: Machine Shop": "ĐÃ NÂNG CẤP: Xưởng Cơ Khí",
  "UPGRADED: Munitions Shop": "ĐÃ NÂNG CẤP: Xưởng Đạn Dược",
  "Needs Chemistry Expert.": "Cần Chuyên Gia Hóa Học.",
  "Big fan of Professor Poliakoff.": "Fan cứng của Giáo sư Poliakoff.",
  "Chemistry Expert: %s": "Chuyên Gia Hóa Học: %s",
  "Research at Library": "Nghiên Cứu Tại Thư Viện",
  "Cram a noisemaker into a homemade mine, and it lures the zombies in before it explodes. Nice.": "Nhét một cái máy tạo tiếng ồn vào quả mìn tự chế, và nó sẽ dụ đám zombie tới trước khi phát nổ. Ngon lành.",
  "Need a Medical Lab": "Cần Một Phòng Thí Nghiệm Y Tế",
  "Individual rounds loaded into magazines for use in the field.": "Đạn lẻ được nạp vào băng để sử dụng ngoài chiến trường.",
  "Small caliber rounds for pistols, revolvers, rifles, and SMGs.": "Đạn cỡ nhỏ dùng cho súng ngắn, súng lục ổ quay, súng trường và súng tiểu liên.",
  ".22-caliber Ammunition": "Đạn Cỡ .22",
  "Small caliber rounds for pistols, revolvers and rifles.": "Đạn cỡ nhỏ dùng cho súng ngắn, súng lục ổ quay và súng trường.",
  "9mm Ammunition": "Đạn 9mm",
  ".357-caliber Ammunition": "Đạn Cỡ .357",
  ".40-caliber Ammunition": "Đạn Cỡ .40",
  ".44-caliber Ammunition": "Đạn Cỡ .44",
  ".45-caliber Ammunition": "Đạn Cỡ .45",
  "5.56mm Ammunition": "Đạn 5.56mm",
  "Powerful round used the world over, includes the entirety of the thirty caliber family of rifle ammunition. Used by battle rifles and long range rifles.": "Loại đạn uy lực được sử dụng trên toàn thế giới, bao gồm toàn bộ dòng đạn súng trường cỡ 30. Được dùng cho súng trường chiến đấu và súng bắn tỉa.",
  "7.62mm Ammunition": "Đạn 7.62mm",
  ".50-caliber Ammunition": "Đạn Cỡ .50",
  "For specialized INCENDIARY SHOTGUNS ONLY. Don't go tearing up the barrels of our regular shotguns.": "CHỈ dùng cho SHOTGUN BẮN ĐẠN CHÁY chuyên dụng. Đừng có phá hỏng nòng mấy khẩu shotgun thông thường của chúng ta.",
  "Incendiary Rounds": "Đạn Cháy",
  "SET UP: Workshop": "ĐÃ DỰNG: Xưởng Chế Tạo",
  "100% faster construction. +10 Material storage capacity.": "Tốc độ xây dựng nhanh hơn 100%. +10 Sức chứa Vật liệu.",
  "SET UP: Warehouse Machine Shop": "ĐÃ DỰNG: Xưởng Cơ Khí Nhà Kho",
  "Impossible.": "Đéo thể nào.",
  "BUILT: Sleeping Area": "ĐÃ XÂY: Khu Vực Ngủ",
  "SET UP: Sleeping Area": "ĐÃ DỰNG: Khu Vực Ngủ",
  "SET UP: Bunkhouse": "ĐÃ DỰNG: Nhà Trọ",
  "Need a Workshop!": "Cần Một Cái Xưởng!",
  "UPGRADED: Bunkhouse": "ĐÃ NÂNG CẤP: Nhà Trọ",
  "Need beds for everyone.": "Cần giường cho tất cả mọi người.",
  "BUILT: Medical Area": "ĐÃ XÂY: Khu Y Tế",
  "UPGRADED: Infirmary": "ĐÃ NÂNG CẤP: Bệnh Xá",
  "Untrained caregiver.": "Người chăm sóc không qua đào tạo.",
  "Health care background.": "Có kinh nghiệm chăm sóc y tế.",
  "Medical Advisor: %s": "Cố Vấn Y Tế: %s",
  "Need a Library!": "Cần Một Thư Viện!",
  "UPGRADED: Medical Lab": "ĐÃ NÂNG CẤP: Phòng Thí Nghiệm Y Tế",
  "Homemade Painkiller": "Thuốc Giảm Đau Tự Chế",
  "SET UP: Medical Area": "ĐÃ DỰNG: Khu Y Tế",
  "No one is sick.": "Đéo có ai bị bệnh cả.",
  "I'm not in charge here.": "Tao đéo phải người quản lý ở đây.",
  "Work has stalled.": "Công việc đã bị đình trệ.",
  "BUILT: Training Area": "ĐÃ XÂY: Khu Tập Luyện",
  "Has a background in health and fitness.": "Có kinh nghiệm về sức khỏe và thể hình.",
  "Trainer: %s": "Người Huấn Luyện: %s",
  "Requires Fitness Expert": "Yêu Cầu Chuyên Gia Thể Hình",
  "Training still active!": "Hoạt động huấn luyện vẫn đang diễn ra!",
  "UPGRADED: Dojo": "ĐÃ NÂNG CẤP: Võ Đường",
  "%+d Cases of Ammunition": "%+d Hộp Đạn Dược",
  "These opportunities are only available if we have a strong reputation.": "Những cơ hội này chỉ mở ra nếu chúng ta có một danh tiếng vững chắc.",
  "BUILT: Cooking Area": "ĐÃ XÂY: Khu Nấu Ăn",
  "Inexperienced cook.": "Đầu bếp tay mơ.",
  "Unfazed by the lack of a microwave.": "Đéo nao núng dù thiếu lò vi sóng.",
  "Top Chef: %s": "Siêu Đầu Bếp: %s",
  "Something to keep us going while we're out in the field.": "Thứ gì đó giúp chúng ta trụ vững khi ra ngoài chiến trường.",
  "Fights fatigue and caffeine headaches. Also causes them.": "Chống lại mệt mỏi và đau đầu do thiếu caffeine. Nhưng cũng chính nó gây ra chuyện đó.",
  "Sweet, warm, and full of love.": "Ngọt ngào, ấm áp và tràn ngập tình yêu thương.",
  "Everyone's stuffed.": "Ai cũng no căng rốn.",
  "Need a Good Cook": "Cần Một Đầu Bếp Xịn",
  "+20 Max Vitality and +10 Max Stamina for everyone.": "+20 Máu Tối Đa và +10 Thể Lực Tối Đa cho mọi người.",
  "%+d Fame": "%+d Danh Tiếng",
  "%d Daily Rations of Food": "%d Khẩu Phần Ăn Hàng Ngày",
  "Actions like this improve your reputation.": "Những hành động như thế này sẽ cải thiện danh tiếng của mày.",
  "SET UP: Kitchen": "ĐÃ DỰNG: Nhà Bếp",
  "SET UP: Farmhouse Kitchen": "ĐÃ DỰNG: Bếp Nông Trại",
  "SET UP: Alamo Kitchen": "ĐÃ DỰNG: Bếp Alamo",
  "SET UP: Church Kitchen": "ĐÃ DỰNG: Bếp Nhà Thờ",
  "SET UP: Rodeo Kitchen": "ĐÃ DỰNG: Bếp Rodeo",
  "BUILT: Storage Area": "ĐÃ XÂY: Khu Lưu Trữ",
  "+10 Food, Ammo, Medicine, Fuel, and Materials capacity.": "+10 Sức chứa Lương thực, Đạn dược, Thuốc men, Nhiên liệu, và Vật liệu.",
  "UPGRADED: Food Storage": "ĐÃ NÂNG CẤP: Kho Lương Thực",
  "I'm not in charge.": "Tao đéo có quyền quyết định.",
  "Don't think they'll listen to me.": "Đéo nghĩ là bọn họ sẽ nghe lời tao đâu."
};

function applyTranslations(chunkPath, mapData) {
  if (!fs.existsSync(chunkPath)) return;
  const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  for (const r of chunk.replacements) {
    if (
      r.sourceText.includes('Action.') || 
      r.sourceText.includes('Bonus.') || 
      r.sourceText.includes('Status.') || 
      r.sourceText.includes('Trait.') || 
      r.sourceText.includes('fsEvent.') || 
      r.sourceText.includes('Need.') || 
      r.sourceText.includes('Game.') || 
      r.sourceText.includes('Stat.') || 
      r.sourceText.includes('Stockpile.') || 
      r.sourceText.includes('Capacity.') || 
      r.sourceText.includes('Allow') || 
      r.sourceText.includes('Enclave.') || 
      r.sourceText.includes('LOG:') || 
      r.sourceText.includes('Family.') || 
      r.sourceText.includes('Required,') || 
      r.sourceText.includes('Home, Npc') || 
      r.sourceText.includes('Max.') || 
      r.sourceText.includes('HideAction') || 
      r.sourceText.includes('Car |') || 
      r.sourceText.match(/^[0-9]+ [A-Za-z\_]+$/) || 
      r.sourceText.match(/^[\+\-]?[0-9\.]+$/)
    ) {
      if (r.sourceText === "Need a Workshop!" || r.sourceText === "Need beds for everyone." || r.sourceText === "Need a Medical Lab" || r.sourceText === "Need a Library!" || r.sourceText === "Need a Good Cook") {
         // allow these
      } else {
        continue;
      }
    }

    if (mapData[r.sourceText]) {
      r.translatedText = mapData[r.sourceText];
    }
  }
  fs.mkdirSync('output/languages/bmd_chunks', { recursive: true });
  fs.writeFileSync(chunkPath.replace('input/languages/', 'output/languages/'), JSON.stringify(chunk, null, 2), 'utf8');
}

applyTranslations('input/languages/bmd_chunks/bmd_chunk_37.json', map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_38.json', map);
console.log('Translated BMD Chunk 37 and 38 successfully!');
