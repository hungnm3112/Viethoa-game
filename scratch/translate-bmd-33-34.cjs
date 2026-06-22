const fs = require('fs');

const map = {
  // Chunk 33
  "We could start gathering books and put together a reference area.": "Chúng ta có thể bắt đầu thu thập sách và gom lại thành một khu tham khảo.",
  "Center for research.": "Trung tâm nghiên cứu.",
  "A place to meet and eat.": "Một nơi để tụ tập và ăn uống.",
  "Cache Ammo": "Cất Giữ Đạn Dược",
  "Ammo Cache": "Kho Đạn",
  "Cache Food": "Cất Giữ Lương Thực",
  "Food Cache": "Kho Lương Thực",
  "Cache Fuel": "Cất Giữ Nhiên Liệu",
  "Fuel Cache": "Kho Nhiên Liệu",
  "Cache Medicine": "Cất Giữ Thuốc Men",
  "Medicine Cache": "Kho Thuốc Men",
  "Cache Materials": "Cất Giữ Vật Liệu",
  "Const. Materials Cache": "Kho Vật Liệu Xây Dựng",
  "To help defend our home.": "Để giúp bảo vệ căn cứ của chúng ta.",
  "Shooting Platform": "Bệ Bắn",
  "Alamo Bell Tower": "Tháp Chuông Alamo",
  "Rodeo Bleachers": "Khán Đài Rodeo",
  "If we work together, we'll find a way to survive.": "Nếu chúng ta đoàn kết lại, chúng ta sẽ tìm ra con đường sống sót.",
  "Defense Up": "Tăng Cường Phòng Thủ",
  "Command Center": "Trung Tâm Chỉ Huy",
  "Attempt to make contact with a new group of survivors": "Thử liên lạc với một nhóm người sống sót mới",
  "Offer Shelter to Survivors": "Cung Cấp Chỗ Trú Ẩn Cho Người Sống Sót",
  "Ask around about an area that has FOOD.": "Hỏi dò về một khu vực có LƯƠNG THỰC.",
  "Ask about Food Caches": "Hỏi Về Kho Lương Thực",
  "Ask around about an area that has MEDICINE.": "Hỏi dò về một khu vực có THUỐC MEN.",
  "Ask about Medicine Caches": "Hỏi Về Kho Thuốc Men",
  "Ask around about an area that has AMMO.": "Hỏi dò về một khu vực có ĐẠN DƯỢC.",
  "Ask about Ammo Caches": "Hỏi Về Kho Đạn Dược",
  "Ask around about an area that has MATERIALS.": "Hỏi dò về một khu vực có VẬT LIỆU.",
  "Ask about Material Caches": "Hỏi Về Kho Vật Liệu",
  "Ask around about an area that has FUEL.": "Hỏi dò về một khu vực có NHIÊN LIỆU.",
  "Ask about Fuel Caches": "Hỏi Về Kho Nhiên Liệu",
  "We could make the things we need to fight zombies instead of having to scavenge for everything.": "Chúng ta có thể tự chế tạo đồ nghề chống zombie thay vì cứ phải đi nhặt mót từng thứ một.",
  "Set Up Basic Workshop": "Dựng Xưởng Cơ Bản",
  "Automatically repair stored weapons each day ... or do it manually at the Supply Locker for 30 Influence.": "Tự động sửa chữa vũ khí cất giữ mỗi ngày ... hoặc tự làm thủ công tại Tủ Tiếp Tế với giá 30 Điểm Ảnh Hưởng.",
  "Dedicated Work Area": "Khu Vực Làm Việc Chuyên Dụng",
  "Construction Expertise": "Chuyên Môn Xây Dựng",
  "Creates a couple of homemade suppressors.": "Chế tạo một vài cái nòng giảm thanh tự chế.",
  "Make Suppressor": "Chế Tạo Nòng Giảm Thanh",
  "Creates a few homemade firecrackers.": "Chế tạo một vài bánh pháo tự chế.",
  "Make Firecracker": "Chế Tạo Pháo Nổ",
  "Creates a few homemade firetraps.": "Chế tạo một vài cái bẫy lửa tự chế.",
  "Make Flame Fougasse": "Chế Tạo Bẫy Lửa Fougasse",
  "A full-fledged workshop would give us the ability to repair cars.": "Một cái xưởng tử tế sẽ giúp chúng ta có khả năng sửa xe.",
  "Upgrade to Workshop": "Nâng Cấp Thành Xưởng Chế Tạo",
  "Free up this space for something else.": "Giải phóng không gian này cho việc khác.",
  "Automatically repair body and tire damage for vehicles parked overnight.": "Tự động sửa chữa vỏ và lốp cho những chiếc xe đậu qua đêm.",
  "Shop Clean": "Dọn Dẹp Xưởng",
  "Decent Tools": "Đồ Nghề Tử Tế",
  "We could specialize this workshop to focus on construction and car repair. NEEDS TOOLS EXPERT.": "Chúng ta có thể chuyên biệt hóa cái xưởng này để tập trung vào xây dựng và sửa xe. CẦN CHUYÊN GIA MÁY MÓC.",
  "Upgrade to Machine Shop": "Nâng Cấp Thành Xưởng Cơ Khí",
  "A workshop focused on making explosives and incendiaries.": "Một xưởng tập trung vào chế tạo thuốc nổ và đạn cháy.",
  "Upgrade to Munitions Shop": "Nâng Cấp Thành Xưởng Đạn Dược",
  "Allows the creation of explosives, in addition to basic vehicle repairs.": "Cho phép chế tạo thuốc nổ, bên cạnh việc sửa chữa xe cộ cơ bản.",
  "Chemistry Equipment": "Thiết Bị Hóa Học",
  "Prevents explosives mishaps. REQUIRES CHEMISTRY EXPERT.": "Ngăn ngừa tai nạn cháy nổ. YÊU CẦU CHUYÊN GIA HÓA HỌC.",
  "Chemistry Expertise": "Chuyên Môn Hóa Học",
  "Creates a couple of homemade box mines. Small chance of mishaps.": "Chế tạo một vài quả mìn hộp tự chế. Có tỷ lệ nhỏ xảy ra sự cố.",
  "Make Box Mine": "Chế Tạo Mìn Hộp",
  "Make Whistling Box Mine": "Chế Tạo Mìn Hộp Có Còi",
  "Creates a few homemade explosives. Small chance of mishap.": "Chế tạo một vài quả thuốc nổ tự chế. Có tỷ lệ nhỏ xảy ra sự cố.",
  "Make Pipe Bomb": "Chế Tạo Bom Ống",
  "Make Steel Pipe Bomb": "Chế Tạo Bom Ống Thép",
  "Creates a few homemade Chemical Incendiaries.": "Chế tạo một vài loại Đạn Cháy Hóa Học tự chế.",
  "Make Chemical Incendiaries": "Chế Tạo Đạn Cháy Hóa Học",
  "Refills some brass to generate several magazines' worth of ammunition.": "Nạp lại đạn đồng để chế vài băng đạn mới.",
  "Make Ammo": "Chế Tạo Đạn",
  "Refills some brass to generate several magazines' worth of .22-caliber ammunition.": "Nạp lại đạn đồng để chế vài băng đạn loại .22.",
  "Make .22 Ammo": "Chế Tạo Đạn .22",
  "Refills some brass to generate a few magazines' worth of 9mm ammunition.": "Nạp lại đạn đồng để chế vài băng đạn loại 9mm.",
  "Make 9mm Ammo": "Chế Tạo Đạn 9mm",
  "Refills some brass to generate several magazines' worth of .357-caliber ammunition.": "Nạp lại đạn đồng để chế vài băng đạn loại .357.",
  "Make .357 Ammo": "Chế Tạo Đạn .357",

  // Chunk 34
  "Refills some brass to generate several magazines' worth of .40-caliber ammunition.": "Nạp lại đạn đồng để chế vài băng đạn loại .40.",
  "Make .40 Ammo": "Chế Tạo Đạn .40",
  "Refills some brass to generate several magazines' worth of .44-caliber ammunition.": "Nạp lại đạn đồng để chế vài băng đạn loại .44.",
  "Make .44 Ammo": "Chế Tạo Đạn .44",
  "Refills some brass to generate a few magazines' worth of .45-caliber ammunition.": "Nạp lại đạn đồng để chế vài băng đạn loại .45.",
  "Make .45 Ammo": "Chế Tạo Đạn .45",
  "Refills some brass to generate a few magazines' worth of 5.56mm ammunition.": "Nạp lại đạn đồng để chế vài băng đạn loại 5.56mm.",
  "Make 5.56mm Ammo": "Chế Tạo Đạn 5.56mm",
  "Refills some brass to generate a few magazines' worth of 7.62mm ammunition.": "Nạp lại đạn đồng để chế vài băng đạn loại 7.62mm.",
  "Make 7.62mm Ammo": "Chế Tạo Đạn 7.62mm",
  "Refills some brass to generate a few magazines' worth of .50 BMG ammunition.": "Nạp lại đạn đồng để chế vài băng đạn loại .50 BMG.",
  "Make .50 BMG Ammo": "Chế Tạo Đạn .50 BMG",
  "Refills some shells to generate a few boxes' worth of shotgun ammunition.": "Nạp lại vỏ đạn để chế vài hộp đạn shotgun.",
  "Make Shotgun Shells": "Chế Tạo Đạn Shotgun",
  "Uses some insane chemistry to generate a box of incendiary shotgun ammunition. For Incendiary Shotguns ONLY.": "Sử dụng chút mánh khóe hóa học điên rồ để chế một hộp đạn cháy shotgun. CHỈ dùng cho Shotgun Bắn Đạn Cháy.",
  "Make Incendiary Rounds": "Chế Tạo Đạn Cháy",
  "Do some very risky work to improvise a handful of 40mm grenades for grenade launchers.": "Làm một việc cực kỳ rủi ro: chế một nắm lựu đạn 40mm dùng cho súng phóng lựu.",
  "Make 40mm Grenades": "Chế Tạo Lựu Đạn 40mm",
  "Automatically repair body, engine, and tire damage. Replace lost bumpers and doors.": "Tự động sửa chữa phần thân, động cơ và lốp bị hỏng. Thay thế cản trước và cửa xe bị mất.",
  "Gas Powered": "Chạy Bằng Xăng",
  "Power Tools": "Máy Móc Dụng Cụ",
  "This room is in disarray. We'll need to fix it up before we can use it.": "Căn phòng này đang như một đống rác. Chúng ta cần dọn dẹp trước khi sử dụng.",
  "Set Up Workshop": "Dựng Xưởng Chế Tạo",
  "Set Up Machine Shop": "Dựng Xưởng Cơ Khí",
  "Built-in facilities can never be upgraded. You get what you get.": "Cơ sở vật chất xây sẵn thì đéo bao giờ nâng cấp được. Có sao xài vậy đi.",
  "A Sleeping Area helps combat Sleep Deprivation. Can be upgraded to a Bunkhouse with actual Beds.": "Khu Vực Ngủ giúp chống lại tình trạng Thiếu Ngủ. Có thể nâng cấp thành Nhà Trọ với Giường Đàng Hoàng.",
  "Set Up Sleeping Area": "Dựng Khu Vực Ngủ",
  "This would give us more spots for sleeping. Just need to clear out the remnants of... what happened here.": "Chỗ này sẽ cho chúng ta thêm chỗ để ngủ. Chỉ cần dọn dẹp sạch sẽ đống tàn dư của... bất cứ thứ gì từng xảy ra ở đây.",
  "Provides no beds, but gives a 50% chance of preventing Sleep Deprivation.": "Đéo có giường đâu, nhưng có 50% tỷ lệ ngăn ngừa Thiếu Ngủ.",
  "Sleeping Bag": "Túi Ngủ",
  "Cots and Futons": "Giường Xếp Và Nệm",
  "The more people we have, the more beds we need. This'll give us a few more places to sleep.": "Càng đông người thì càng cần nhiều giường. Nâng cấp sẽ cho chúng ta thêm vài chỗ ngủ.",
  "Upgrade to Bunkhouse": "Nâng Cấp Thành Nhà Trọ",
  "Remove Sleeping Area": "Dỡ Bỏ Khu Vực Ngủ",
  "Provides +8 beds.": "Cung cấp +8 giường.",
  "Increases everyone's stamina by 10. (MUST HAVE A BED FOR EVERYONE.)": "Tăng thể lực của mọi người lên 10. (PHẢI CÓ GIƯỜNG CHO TẤT CẢ MỌI NGƯỜI.)",
  "Good Sleep": "Ngủ Ngon",
  "Good Night's Sleep": "Một Giấc Ngủ Ngon",
  "Remove Bunkhouse": "Dỡ Bỏ Nhà Trọ",
  "Set Up Medical Area": "Dựng Khu Y Tế",
  "+10 Max Vitality for everyone. 15% Recovery Chance from injury/illness each day.": "+10 Máu Tối Đa cho mọi người. 15% Tỷ Lệ Phục Hồi khỏi chấn thương/bệnh tật mỗi ngày.",
  "Free Health Care": "Chăm Sóc Y Tế Miễn Phí",
  "Upgrade to Infirmary": "Nâng Cấp Thành Bệnh Xá",
  "+10 Max Vitality for everyone. 30% Recovery Chance from injury/illness each day.": "+10 Máu Tối Đa cho mọi người. 30% Tỷ Lệ Phục Hồi khỏi chấn thương/bệnh tật mỗi ngày.",
  "Quality Health Care": "Chăm Sóc Y Tế Chất Lượng",
  "+20% Recovery Chance. REQUIRES TRAINED HEALER.": "+20% Tỷ Lệ Phục Hồi. YÊU CẦU BÁC SĨ CHUYÊN MÔN.",
  "Medical Professional": "Chuyên Gia Y Tế",
  "Upgrade to Medical Lab": "Nâng Cấp Thành Phòng Thí Nghiệm Y Tế",
  "Allows manufacture of painkillers and stimulants.": "Cho phép chế tạo thuốc giảm đau và thuốc kích thích.",
  "Lab Equipment": "Thiết Bị Thí Nghiệm",
  "Creates a few homemade Mild Stims.": "Chế tạo một vài loại Thuốc Kích Thích Nhẹ tự chế.",
  "Make Mild Stims": "Chế Tạo Kích Thích Nhẹ",
  "Creates a few homemade Potent Stims.": "Chế tạo một vài loại Thuốc Kích Thích Mạnh tự chế.",
  "Make Potent Stims": "Chế Tạo Kích Thích Mạnh",
  "Creates some homemade painkillers.": "Chế tạo một vài loại thuốc giảm đau tự chế.",
  "Make Homemade Painkillers": "Chế Tạo Thuốc Giảm Đau Tự Chế",
  "There's a good infirmary here. Just need to stock it and clean up a little... Okay, a lot.": "Có một cái bệnh xá ngon lành ở đây. Chỉ cần chất đồ vào và dọn dẹp một chút... Ừ thì, dọn nhiều chút.",
  "Set Up Infirmary": "Dựng Bệnh Xá",
  "We could use our medical stockpiles to try to heal the sick. I don't really have any influence here, though. I don't think it's up to me.": "Chúng ta có thể dùng kho thuốc men để thử chữa cho người bệnh. Mặc dù tao đéo có chút sức ảnh hưởng nào ở đây, nên tao không nghĩ đó là quyết định của tao.",
  "Heal the Sick": "Chữa Trị Người Bệnh",
  "A training area improves physical fitness and gives us a place to hone combat skills.": "Khu tập luyện cải thiện thể chất và cho chúng ta nơi để mài giũa kỹ năng chiến đấu.",
  "Set Up Training Area": "Dựng Khu Tập Luyện",
  "+10 Stamina for everyone.": "+10 Thể Lực cho mọi người.",
  "Exercise Area": "Khu Thể Dục",
  "Prevents injuries. Allows establishment of a Fitness Regimen.": "Ngăn ngừa chấn thương. Cho phép thiết lập một Chế Độ Tập Luyện.",
  "Organized exercise program: An additional +10 Stamina for everyone. ": "Chương trình tập luyện bài bản: Thêm +10 Thể Lực cho mọi người. ",
  "Fitness Regimen": "Chế Độ Tập Luyện",
  "An additional +10 Stamina for everyone. REQUIRES FITNESS EXPERT.": "Thêm +10 Thể Lực cho mọi người. YÊU CẦU CHUYÊN GIA THỂ HÌNH.",
  "A dojo provides the right space to practice specific survival techniques.": "Võ đường cung cấp một không gian thích hợp để thực hành các kỹ thuật sinh tồn chuyên biệt.",
  "Upgrade to Dojo": "Nâng Cấp Thành Võ Đường",
  "Increased XP from melee combat.": "Tăng XP nhận được từ cận chiến.",
  "Gain increased XP from melee combat.": "Nhận thêm XP từ cận chiến.",
  "Gain +3 AMMO to train survivors from another community in self-defense.": "Nhận được +3 ĐẠN DƯỢC khi huấn luyện tự vệ cho những người sống sót ở cộng đồng khác.",
  "COMMERCE: Train Outsiders": "GIAO THƯƠNG: Huấn Luyện Người Ngoài",
  "Set Up Cooking Area": "Dựng Khu Nấu Ăn",
  "Protects against Food Contamination.": "Bảo vệ chống lại Ngộ Độc Thực Phẩm.",
  "Mise En Place": "Mise En Place (Sắp Xếp Sẵn Sàng)",
  "Allows the preparation of feasts. (Need someone who really knows how to cook, though.)": "Cho phép chuẩn bị những bữa tiệc thịnh soạn. (Tất nhiên là cần một người thực sự biết nấu ăn.)",
  "Good Cook": "Đầu Bếp Xịn",
  "Piece together a few portable snacks from general food supplies.": "Gom góp vài món ăn vặt bỏ túi từ kho lương thực chung.",
  "Make Snacks": "Làm Đồ Ăn Vặt",
  "Brew some coffee, to keep our scavengers awake and alert.": "Pha chút cà phê, để giữ cho mấy tay nhặt mót tỉnh táo và tập trung.",
  "Make Coffee": "Pha Cà Phê",
  "Bake a delicious pie!": "Nướng một cái bánh tart thơm phức!",
  "Make Pie": "Làm Bánh Tart",
  "+20 Max Vitality for everyone.": "+20 Máu Tối Đa cho mọi người.",
  "Big Meal": "Bữa Ăn Lớn",
  "20 Max Vitality and +10 Max Stamina for everyone.": "20 Máu Tối Đa và +10 Thể Lực Tối Đa cho mọi người.",
  "Additional Vitality bonus for everyone.": "Cộng thêm điểm Máu cho mọi người.",
  "Cook a Big Meal": "Nấu Một Bữa Thịnh Soạn",
  "Additional Vitality and Stamina bonuses for everyone. (High likelihood of needing special ingredients.) REQUIRES GOOD COOK.": "Cộng thêm điểm Máu và Thể Lực cho mọi người. (Rất có thể sẽ cần nguyên liệu đặc biệt.) YÊU CẦU ĐẦU BẾP XỊN.",
  "Prepare a Feast": "Chuẩn Bị Một Bữa Tiệc",
  "Give away 5 FOOD to help your neighbors survive.": "Cho đi 5 LƯƠNG THỰC để giúp hàng xóm sống sót.",
  "CHARITY: Soup Kitchen": "TỪ THIỆN: Bếp Ăn Tình Thương",
  "There a good kitchen here. Just need to clear out all the chaos and we can start using it.": "Có một nhà bếp xịn ở đây. Chỉ cần dọn dẹp đống rác rưởi là chúng ta có thể bắt đầu sử dụng.",
  "Set Up Kitchen": "Dựng Nhà Bếp",
  "Increases our storage capacity for all the key survival resources (Food, Medicine, Building Materials, Ammunition, and Fuel.)  REQUIRES WORKSHOP.": "Tăng sức chứa kho cho tất cả các tài nguyên sinh tồn quan trọng (Lương thực, Thuốc men, Vật liệu xây dựng, Đạn dược, và Nhiên liệu). YÊU CẦU XƯỞNG CHẾ TẠO.",
  "Build Storage Area": "Xây Khu Lưu Trữ",
  "+20 Food, Ammo, Medicine, Fuel, and Materials capacity.": "+20 Sức chứa Lương thực, Đạn dược, Thuốc men, Nhiên liệu, và Vật liệu."
};

function applyTranslations(chunkPath, mapData) {
  if (!fs.existsSync(chunkPath)) return;
  const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  for (const r of chunk.replacements) {
    if (
      r.sourceText.includes('Action.') || 
      r.sourceText.includes('Bonus.') || 
      r.sourceText.includes('Automatic,') || 
      r.sourceText.includes('DelayOutputs,') || 
      r.sourceText.includes('ActivateOnce,') || 
      r.sourceText.includes('Garden Fancy') || 
      r.sourceText.match(/^[0-9\.]+$/) || 
      r.sourceText.match(/^[\+\-][0-9\.]+%?$/)
    ) {
      if (r.sourceText === "+20 Max Vitality for everyone.") {
         // this one is safe
      } else if (r.sourceText === "+10 Stamina for everyone.") {
         // this one is safe
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

applyTranslations('input/languages/bmd_chunks/bmd_chunk_33.json', map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_34.json', map);
console.log('Translated BMD Chunk 33 and 34 successfully!');
