const fs = require('fs');

const map = {
  // Chunk 35
  "Storage Space": "Không Gian Lưu Trữ",
  "Setting things up for safe food storage allows us to attempt sanitary food storage.": "Thiết lập một khu lưu trữ thực phẩm an toàn cho phép chúng ta bảo quản đồ ăn hợp vệ sinh hơn.",
  "Upgrade to Food Storage": "Nâng Cấp Thành Kho Lương Thực",
  "Remove Storage Area": "Dỡ Bỏ Khu Lưu Trữ",
  "+30 Food, Ammo, Medicine, Fuel, and Materials capacity.": "+30 Sức chứa Lương thực, Đạn dược, Thuốc men, Nhiên liệu, và Vật liệu.",
  "Protects against spoilage.": "Bảo vệ chống lại sự ôi thiu.",
  "Food Preservation": "Bảo Quản Thực Phẩm",
  "We should do some experiments with food preservation. Pickling, salting, smoking, canning. So many things to try. REQUIRES SOME EXPERIMENTATION.": "Chúng ta nên thử nghiệm vài cách bảo quản thực phẩm. Ngâm chua, ướp muối, hun khói, đóng hộp. Có quá nhiều thứ để thử. YÊU CẦU THỬ NGHIỆM.",
  "Try Preserving Some Food": "Thử Bảo Quản Thực Phẩm",
  "Protects against spoilage and opens up new recipes.": "Bảo vệ chống lại sự ôi thiu và mở khóa các công thức nấu ăn mới.",
  "Preserve Food": "Bảo Quản Thực Phẩm",
  "Turns food into fuel.": "Biến thức ăn thành nhiên liệu.",
  "Create Biodiesel": "Chế Tạo Xăng Sinh Học",
  "Gain +5 FOOD in exchange for pickling and curing food for another survivor group.": "Nhận được +5 LƯƠNG THỰC khi muối chua và phơi khô thức ăn cho một nhóm người sống sót khác.",
  "COMMERCE: Food Preservation": "GIAO THƯƠNG: Bảo Quản Thực Phẩm",
  "Gain +3 AMMO for creating biodiesel fuel for another group of survivors.": "Nhận được +3 ĐẠN DƯỢC khi chế tạo xăng sinh học cho một nhóm người sống sót khác.",
  "COMMERCE: Biodiesel": "GIAO THƯƠNG: Xăng Sinh Học",
  "With a refrigerated storage area, we can really improve our ability to keep food fresh.": "Với một kho lạnh, chúng ta có thể cải thiện đáng kể khả năng giữ thức ăn tươi ngon.",
  "Upgrade to Refrigerated Storage": "Nâng Cấp Thành Kho Lạnh",
  "Remove Food Storage": "Dỡ Bỏ Kho Lương Thực",
  "+40 Food, Ammo, Medicine, Fuel, and Materials capacity.": "+40 Sức chứa Lương thực, Đạn dược, Thuốc men, Nhiên liệu, và Vật liệu.",
  "Dramatically reduces food spoilage and food poisoning.": "Giảm thiểu đáng kể tình trạng thức ăn ôi thiu và ngộ độc thực phẩm.",
  "Remove Refrigerated Storage": "Dỡ Bỏ Kho Lạnh",
  "There's a good storage space here. Just need to clear out all the chaos and we can start using it.": "Có một không gian lưu trữ tốt ở đây. Chỉ cần dọn dẹp đống lộn xộn này là chúng ta có thể bắt đầu sử dụng.",
  "Fix Up Storage Room": "Dọn Dẹp Kho Lưu Trữ",
  "Fix Up Refrigerated Storage Room": "Dọn Dẹp Kho Lạnh",
  "Fix Up Bedroom": "Dọn Dẹp Phòng Ngủ",
  "Fix Up Pastor's Room": "Dọn Dẹp Phòng Mục Sư",
  "Fix Up Lockers": "Dọn Dẹp Tủ Đồ",
  "A garden would let us grow some of our own food instead of always having to scavenge.": "Một khu vườn sẽ cho phép chúng ta tự trồng trọt thay vì lúc nào cũng phải đi nhặt mót.",
  "Create a Garden": "Làm Vườn",
  "It will take a while for the plants to mature.": "Sẽ mất một thời gian để cây cối trưởng thành.",
  "2 Daily Rations of Food per day": "Cung cấp 2 Khẩu Phần Ăn mỗi ngày",
  "With the right person tending the garden, we'll have a chance of higher yields.": "Với đúng người chăm sóc khu vườn, chúng ta sẽ có cơ hội thu hoạch năng suất cao hơn.",
  "Green Thumb": "Mát Tay Trồng Trọt",
  "Once it grows back, this should give us a substantial increase in the amount of food grown.": "Một khi mọc lại, thứ này sẽ cho chúng ta một lượng thức ăn tăng lên đáng kể.",
  "Upgrade to Greenhouse": "Nâng Cấp Thành Nhà Kính",
  "The crops are almost fully grown.": "Mùa màng đã gần như trưởng thành.",
  "4 Daily Rations of Food per day": "Cung cấp 4 Khẩu Phần Ăn mỗi ngày",
  "6 Daily Rations of Food per day": "Cung cấp 6 Khẩu Phần Ăn mỗi ngày",
  "3 Daily Rations of Food per day": "Cung cấp 3 Khẩu Phần Ăn mỗi ngày",
  "9 Daily Rations of Food per day": "Cung cấp 9 Khẩu Phần Ăn mỗi ngày",
  "Build Library": "Xây Thư Viện",
  "By sharing knowledge, we all improve our Wits faster.": "Bằng cách chia sẻ kiến thức, tất cả chúng ta sẽ cải thiện Trí Tuệ nhanh hơn.",
  "Store of Knowledge": "Kho Tàng Kiến Thức",
  "+300% research speed. REQUIRES GOOD RESEARCHER.": "+300% tốc độ nghiên cứu. YÊU CẦU NGƯỜI NGHIÊN CỨU GIỎI.",
  "Gain +2 AMMO for providing library access to another group of survivors.": "Nhận được +2 ĐẠN DƯỢC khi cho một nhóm người sống sót khác sử dụng thư viện.",
  "COMMERCE: Library Access": "GIAO THƯƠNG: Truy Cập Thư Viện",
  "This would allow us to break down the ammo we scavenge, and manufacture the calibers we actually need. REQUIRES A MUNITIONS SHOP.": "Điều này cho phép chúng ta tháo dỡ đạn nhặt được và chế tạo loại đạn chúng ta thực sự cần. YÊU CẦU XƯỞNG ĐẠN DƯỢC.",
  "Research Ammo Manufacture": "Nghiên Cứu Chế Tạo Đạn",
  "This would improve yields from our gardens. REQUIRES A GARDEN.": "Điều này sẽ cải thiện năng suất từ các khu vườn của chúng ta. YÊU CẦU VƯỜN.",
  "Research Greenhouse Gardening": "Nghiên Cứu Trồng Trọt Nhà Kính",
  "Would let us convert Food to Fuel. REQUIRES FOOD STORAGE FACILITY.": "Cho phép chúng ta chuyển đổi Lương Thực thành Nhiên Liệu. YÊU CẦU CƠ SỞ LƯU TRỮ LƯƠNG THỰC.",
  "Research Biodiesel": "Nghiên Cứu Xăng Sinh Học",
  "Unlocks the ability to create Box Mines. REQUIRES A MUNITIONS SHOP.": "Mở khóa khả năng chế tạo Mìn Hộp. YÊU CẦU XƯỞNG ĐẠN DƯỢC.",
  "Research Box Mine": "Nghiên Cứu Mìn Hộp",
  "Unlocks the ability to create Whistling Box Mines. REQUIRES A MUNITIONS SHOP.": "Mở khóa khả năng chế tạo Mìn Hộp Có Còi. YÊU CẦU XƯỞNG ĐẠN DƯỢC.",
  "Research Whistling Box Mine": "Nghiên Cứu Mìn Hộp Có Còi",
  "Unlocks the ability to create Pipe Bombs. REQUIRES A MUNITIONS SHOP.": "Mở khóa khả năng chế tạo Bom Ống. YÊU CẦU XƯỞNG ĐẠN DƯỢC.",
  "Research Pipe Bomb": "Nghiên Cứu Bom Ống",
  "Unlocks the ability to create Steel Pipe Bombs. REQUIRES A MUNITIONS SHOP.": "Mở khóa khả năng chế tạo Bom Ống Thép. YÊU CẦU XƯỞNG ĐẠN DƯỢC.",
  "Research Steel Pipe Bomb": "Nghiên Cứu Bom Ống Thép",
  "Unlocks the ability to create Chemical Incendiaries. REQUIRES A MUNITIONS SHOP and MEDICAL LAB.": "Mở khóa khả năng chế tạo Đạn Cháy Hóa Học. YÊU CẦU XƯỞNG ĐẠN DƯỢC và PHÒNG THÍ NGHIỆM Y TẾ.",
  "Research Chemical Incendiaries": "Nghiên Cứu Đạn Cháy Hóa Học",
  "Would allow us to create more effective stimulants (Uses up medical supplies.) REQUIRES MEDICAL LAB.": "Cho phép chúng ta chế tạo các loại thuốc kích thích hiệu quả hơn (Tiêu thụ vật tư y tế). YÊU CẦU PHÒNG THÍ NGHIỆM Y TẾ.",
  "Research Potent Homemade Stims": "Nghiên Cứu Thuốc Kích Thích Tự Chế Mạnh",
  "There's a good library here. Just need to clear out all the chaos and we can start using it.": "Có một cái thư viện xịn ở đây. Chỉ cần dọn dẹp đống rác rưởi là chúng ta có thể bắt đầu sử dụng.",
  "Fix Up Library": "Dọn Dẹp Thư Viện",
  "Eating together can help reduce discord in the community and maintain cleanliness.": "Ăn uống cùng nhau có thể giúp giảm bớt bất hòa trong cộng đồng và giữ gìn vệ sinh.",
  "Set Up Dining Area": "Dựng Khu Ăn Uống",
  "Reduces discord. Protects against vermin.": "Giảm bớt bất hòa. Chống lại sâu bọ chuột bọ.",
  "Family Meals": "Bữa Ăn Gia Đình",
  "Remove Dining Area": "Dỡ Bỏ Khu Ăn Uống",
  "Repairs all damaged components of the vehicle. REQUIRES TOOLS EXPERT.": "Sửa chữa tất cả các bộ phận bị hỏng của xe. YÊU CẦU CHUYÊN GIA MÁY MÓC.",
  "Repair all": "Sửa chữa tất cả",
  "Replaces the vehicle's tires.": "Thay lốp xe.",
  "Replace tires": "Thay lốp",
  "Replaces the vehicle's doors.": "Thay cửa xe.",
  "Replace doors": "Thay cửa",
  "Repairs the vehicle's body.": "Sửa chữa phần thân xe.",
  "Repair body": "Sửa chữa thân xe",
  "Repairs the vehicle's engine.  REQUIRES TOOLS EXPERT.": "Sửa chữa động cơ xe. YÊU CẦU CHUYÊN GIA MÁY MÓC.",
  "Repair engine": "Sửa chữa động cơ",
  "Space for one vehicle. Find this location outside the base, and park there to gain its benefits.": "Chỗ đậu cho một chiếc xe. Tìm vị trí này bên ngoài căn cứ và đậu xe ở đó để nhận được lợi ích.",
  "Parking Space": "Chỗ Đậu Xe",
  "Cars left here overnight will be repaired a bit. REQUIRES WORKSHOP.": "Xe đậu ở đây qua đêm sẽ được sửa chữa một chút. YÊU CẦU XƯỞNG CHẾ TẠO.",
  "Auto Repair": "Tự Động Sửa Chữa",
  "Provides additional resources each day... until the supply runs out.": "Cung cấp thêm tài nguyên mỗi ngày... cho đến khi cạn kiệt.",
  "Resource Cache": "Kho Tài Nguyên",
  "A place to resupply without traveling all the way home.": "Một nơi để tiếp tế mà không cần phải đi thẳng về nhà.",
  "Supply Locker": "Tủ Tiếp Tế",
  "15% chance of missing allies coming home safely on their own.": "15% tỷ lệ đồng minh mất tích tự tìm được đường về nhà an toàn.",
  "Safe Haven": "Nơi Trú Ẩn An Toàn",
  "Increase protected range around the outpost.": "Tăng phạm vi bảo vệ xung quanh tiền đồn.",
  "Set Traps for Passing Hordes": "Đặt Bẫy Bắt Bầy Đàn Đi Qua",
  "Surrender this location to the zeds.": "Nhường lại vị trí này cho đám zed.",
  "Abandon Outpost": "Bỏ Rơi Tiền Đồn",
  "Outpost Built": "Tiền Đồn Đã Xây",
  "Something to protect our perimeter. Having a watchtower increases the safe area around our home.": "Một thứ gì đó để bảo vệ vành đai của chúng ta. Có một tháp canh sẽ tăng khu vực an toàn xung quanh nhà.",
  "Build Watchtower": "Xây Tháp Canh",

  // Chunk 36
  "Having someone up here should help keep the zeds at bay.": "Có người đứng canh ở trên này sẽ giúp giữ đám zed tránh xa.",
  "We've been actively sniping zombies, giving us a larger safe area around our home.": "Chúng ta đã tích cực bắn tỉa đám zombie, giúp mở rộng khu vực an toàn xung quanh nhà.",
  "Sniping Zombies": "Bắn Tỉa Zombie",
  "We can extend the safe area around our home with a little sharpshooting.": "Chúng ta có thể mở rộng khu vực an toàn xung quanh nhà bằng một chút tài thiện xạ.",
  "Snipe Zombies": "Bắn Tỉa Zombie",
  "We could make something a little less rickety. REQUIRES WORKSHOP.": "Chúng ta có thể làm thứ gì đó bớt ọp ẹp hơn. YÊU CẦU XƯỞNG CHẾ TẠO.",
  "Upgrade to Shooting Platform": "Nâng Cấp Thành Bệ Bắn",
  "Increased XP from shooting.": "Tăng XP nhận được từ bắn súng.",
  "Firearms Training": "Huấn Luyện Súng Đạn",
  "Gain increased XP from shooting.": "Nhận thêm XP từ bắn súng.",
  "Gain +3 AMMO to train survivors from another community with firearms.": "Nhận được +3 ĐẠN DƯỢC khi huấn luyện sử dụng súng cho những người sống sót ở cộng đồng khác."
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
      r.sourceText.match(/^[0-9]+ [A-Za-z\_]+$/) || 
      r.sourceText.match(/^[\+\-]?[0-9\.]+$/)
    ) {
      continue;
    }

    if (mapData[r.sourceText]) {
      r.translatedText = mapData[r.sourceText];
    }
  }
  fs.mkdirSync('output/languages/bmd_chunks', { recursive: true });
  fs.writeFileSync(chunkPath.replace('input/languages/', 'output/languages/'), JSON.stringify(chunk, null, 2), 'utf8');
}

applyTranslations('input/languages/bmd_chunks/bmd_chunk_35.json', map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_36.json', map);
console.log('Translated BMD Chunk 35 and 36 successfully!');
