const fs = require('fs');

const bmd_chunk_3_map = {
  "Shotgun_Russian 12K": "Súng Shotgun Russian 12K",
  "Blunt Light": "Vũ khí Cùn Nhẹ (Blunt Light)",
  "2x4 Bracket": "Khúc Gỗ 2x4 Gắn Khớp",
  "2x4 Nails": "Khúc Gỗ 2x4 Đóng Đinh",
  "Table leg": "Chân Bàn",
  "Golf Club": "Gậy Đánh Golf",
  "Edged Light": "Vũ khí Sắc Nhẹ (Edged Light)",
  "Pipe Valve": "Ống Nước Gắn Van",
  "Machete Fancy": "Mã Tấu Cao Cấp",
  "Pipe straight": "Ống Nước Thẳng",
  "Blunt Heavy": "Vũ khí Cùn Nặng (Blunt Heavy)"
};

const bmd_chunk_4_map = {
  "Baton Cop": "Dùi Cui Cảnh Sát",
  "Firemans Axe": "Rìu Cứu Hỏa",
  "Waki Short": "Kiếm Ngắn Waki",
  "Bat Cricket": "Gậy Bóng Chày Cricket",
  "Pipe Threader": "Ống Nước Ren",
  "Shotgun Shells": "Đạn Shotgun",
  "For shotguns.": "Dành cho súng Shotgun.",
  "Incendiary Shotgun Shells": "Đạn Shotgun Cháy",
  "Incendiary ammo for compatible shotguns.": "Đạn cháy dành cho súng Shotgun tương thích.",
  "Grenade Launcher Ammo": "Đạn Súng Phóng Lựu",
  "For grenade launchers. Obviously.": "Dành cho súng phóng lựu. Rõ ràng rồi.",
  "9 mm": "Đạn 9 mm",
  "Small-caliber rounds for pistols, revolvers and rifles.": "Đạn cỡ nhỏ dành cho súng lục, rulo và súng trường.",
  ".22 caliber": "Đạn .22 caliber",
  "Small-caliber rounds for pistols, revolvers, rifles, and SMGs.": "Đạn cỡ nhỏ cho súng lục, rulo, súng trường và SMG.",
  ".357 caliber": "Đạn .357 caliber",
  "Powerful round for revolvers and some rifles.": "Đạn mạnh dành cho súng rulo và một số loại súng trường.",
  ".40 caliber": "Đạn .40 caliber",
  "Mid-range round for pistols and some submachineguns.": "Đạn tầm trung cho súng lục và một số súng tiểu liên.",
  ".44 caliber": "Đạn .44 caliber",
  "Powerful round primarily for revolvers and some rifles.": "Đạn mạnh chủ yếu cho súng rulo và vài loại súng trường.",
  ".45 caliber": "Đạn .45 caliber",
  "Powerful mid-range workhorse for pistols, some revolvers and rifles.": "Loại đạn tầm trung cực mạnh cho súng lục, rulo và súng trường.",
  ".50 caliber": "Đạn .50 caliber",
  "Very powerful round for large frame revolvers, pistols and long range rifles.": "Đạn cực mạnh dành cho súng rulo cỡ lớn, súng lục và súng trường bắn tỉa.",
  "5.56mm ": "Đạn 5.56mm",
  "Standard NATO battle rifle caliber, includes the .223 caliber family of rounds as well.": "Cỡ đạn súng trường chuẩn NATO, bao gồm cả dòng đạn .223 caliber.",
  "7.62mm ": "Đạn 7.62mm",
  "Powerful round used the world over. Includes the entirety of the thirty-caliber family of rifle ammunition. Used by battle rifles and long-range rifles.": "Loại đạn mạnh được dùng trên toàn cầu. Phù hợp cho các dòng súng trường chiến đấu và bắn tỉa.",
  "Small Backpack": "Balo Nhỏ",
  "Traveling light is good, but having what you need is better.": "Đi nhẹ thì tốt, nhưng mang đủ đồ còn tốt hơn.",
  "Medium Pack": "Balo Tầm Trung",
  "Large Backpack": "Balo Lớn",
  "More carrying capacity, but it's bulky.": "Mang được nhiều đồ hơn, nhưng khá cồng kềnh.",
  "Large Pack": "Balo Cỡ Lớn",
  "Low Backpack": "Balo Đeo Thấp",
  "A low-slung bag for the efficient packer.": "Chiếc túi đeo thấp dành cho dân chuyên gói ghém.",
  "School Backpack": "Balo Học Sinh",
  "You can't start off a new school year without a sweet-ass new backpack!": "Làm sao bắt đầu năm học mới mà không có cái balo xịn xò này chứ!",
  "School Pack": "Cặp Học Sinh",
  "Numbs the pain, but won't help serious wounds.": "Giảm đau, nhưng không có tác dụng với vết thương nặng.",
  "Numbs the pain, but won't help serious wounds. Typical over-the-counter stuff.": "Giảm đau, nhưng không chữa được vết thương nặng. Hàng bán ngoài tiệm thuốc.",
  "Numbs the pain, but won't help serious wounds. Typical over-the-counter stuff. Come on, everybody knows what aspirin is.": "Giảm đau, không trị được thương nặng. Ai mà chẳng biết Aspirin là cái đéo gì.",
  "Numbs the pain, but won't help serious wounds. Typical over-the-counter stuff. I like the ones with the sugary coating.": "Giảm đau, không trị được thương nặng. Tao thích loại có bọc đường hơn.",
  "Numbs the pain, but won't help serious wounds. Serious stuff. Feels pretty damn good, though.": "Thuốc mạnh đấy. Giảm đau, không chữa được vết thương hở. Nhưng phê vãi lúa.",
  "Numbs the pain, but won't help serious wounds. Typical over-the-counter stuff. Tastes like ass, but knocks out just about anything.": "Giảm đau. Hàng tiệm thuốc. Vị như c*t, nhưng dập được đủ loại cơn đau.",
  "Numbs the pain, but won't help serious wounds. Serious stuff. Also good for getting off the junk.": "Thuốc mạnh. Giảm đau tốt, còn giúp cai nghiện nữa.",
  "Serious stuff. Numbs the pain, but won't help serious wounds. It'll just make you not care about them.": "Hàng xịn. Giảm đau, không chữa được thương, chỉ làm mày đéo quan tâm đến nó nữa thôi.",
  "Improvised Painkiller": "Thuốc Giảm Đau Tự Chế",
  "Good stuff. Numbs the pain, but won't help serious wounds.": "Hàng tốt. Giảm đau, nhưng vết thương nặng thì chịu.",
  "Eat for a temporary stamina boost.": "Ăn vào để tăng tạm thời sức bền.",
  "So good...": "Ngon vãi...",
  "Restores max stamina a little. It's cold, it's stale, and I think it was filtered with zombie guts, but dammit, it's coffee.": "Hồi chút Thể lực. Lạnh ngắt, thiu rồi, cứ như được lọc qua ruột thây ma ấy. Nhưng chết tiệt, đây là cà phê mà.",
  "Energy Drink": "Nước Tăng Lực",
  "Mmmm, guarana.  (Removes penalties to your maximum stamina)": "Mmmm, mùi guarana. (Xóa bỏ hình phạt lên giới hạn Thể lực)",
  "Mild Stims": "Thuốc Kích Thích Nhẹ",
  "Restores max Stamina a little. Fresh from our med lab. Heisenberg would be proud.": "Hồi chút giới hạn Thể lực. Hàng mới ra lò từ phòng y tế. Heisenberg mà thấy chắc tự hào lắm.",
  "Potent Stims": "Thuốc Kích Thích Liều Cao",
  "Restores max Stamina a lot. Fresh from our lab, cooked up extra potent. (Addictive?) ": "Hồi nhiều Thể lực. Vừa nấu xong, liều cực mạnh. (Có gây nghiện không nhỉ?)",
  "Restores max stamina a fair bit. (Addictive?) Pure glass--the good stuff. Accept no substitute.": "Hồi khá nhiều Thể lực. (Gây nghiện?) Hàng tinh khiết đét—đồ xịn đấy. Không có gì thay thế được đâu.",
  "Trucker Pills": "Thuốc Của Dân Lái Xe Tải",
  "Restores max stamina a fair bit. (Addictive?) King of the Road Trucking Pills. Truck as hard as you want. The label says fenethyl-something, only approved in Europe.": "Hồi Thể lực. Thuốc của dân lái xe đường dài. Cứ chạy thoải mái đi. Nhãn ghi chất gì đấy fenethyl, chỉ được duyệt ở Châu Âu.",
  "Restores max stamina a fair bit. (Addictive?) Active ingredient: modafinil. Whatever that is.": "Hồi Thể lực. (Gây nghiện?) Thành phần: modafinil. Đéo biết là cái mẹ gì luôn.",
  "Sets zeds on fire. This one's just a rag stuffed into a bottle of booze. Top shelf too.": "Đốt cháy lũ xác sống. Chỉ là giẻ rách nhét vào chai rượu vang loại xịn thôi.",
  "Petrol Bomb": "Bom Xăng",
  "Sets zeds on fire. They don't seem to like it much. This one's made with gasoline.": "Đốt cháy tụi xác sống. Có vẻ chúng đéo thích thú gì mấy. Quả này pha xăng đấy.",
  "Wilkerson Private Reserve": "Chai Rượu Lậu Của Wilkerson",
  "Light em' up! Redneck's special blend. Pretty sure it's pure wood-grain alcohol.": "Thiêu sống chúng nó đi! Hàng tự nấu của mấy tay nhà quê. Đích thị là cồn công nghiệp rồi.",
  "Zeds dislike fire. This one comes fresh out of our workshop, so go us!": "Bọn zombie cực ghét lửa. Hàng mới ra lò từ xưởng của nhà, quẩy thôi!",
  "Chemical Incendiary": "Lựu Đạn Cháy Hóa Học",
  "Sets zeds on fire. They don't seem to like it much. Watch it with this one--it's got a kick.": "Đốt cháy lũ thây ma. Chúng đéo khoái tí nào. Coi chừng quả này—nổ to phết đấy.",
  "The AN-M14 TH3 chemical incendiary. Pretty sure this one could melt through a truck engine.": "Lựu đạn cháy AN-M14 TH3. Chắc kèo là nó nung chảy được cả động cơ xe tải.",
  "Frag Grenade": "Lựu Đạn Nổ",
  "Pull pin, toss, wait for boom. Repeat as necessary.": "Rút chốt, ném, chờ bùm. Cứ thế mà làm.",
  "Improvised Explosive": "Thuốc Nổ Tự Chế",
  "You throw it. It goes boom. If you're lucky, not right in your face.": "Ném đi. Nó sẽ nổ bùm. Nếu hên thì nó đéo nổ ngay vô mặt mày.",
  "M67 Grenade": "Lựu Đạn M67",
  "Standard military hand grenade. This one fell off a truck, a big green truck.": "Lựu đạn chuẩn quân đội. Quả này rơi từ trên xe tải xuống, một chiếc xe tải bọc thép bự chảng.",
  "Mk2 Grenade": "Lựu Đạn Mk2",
  "The old pineapple grenade, I'm sure it's still ok after sitting around for 65 years.": "Lựu đạn mỏ vịt thời đồ đá, tao cá là nó vẫn dùng tốt sau 65 năm nằm kho.",
  "Pipe Bomb": "Bom Ống",
  "It's a bunch of explosives stuffed into a pipe. What could go wrong?": "Nhét đống thuốc nổ vô cái ống nước. Thì có cái đéo gì sai được chứ?",
  "Steel Pipe Bomb": "Bom Ống Thép"
};

function applyTranslations(chunkPath, map) {
  if (!fs.existsSync(chunkPath)) return;
  const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  for (const r of chunk.replacements) {
    if (map[r.sourceText]) {
      r.translatedText = map[r.sourceText];
    }
  }
  fs.mkdirSync('output/languages/bmd_chunks', { recursive: true });
  fs.writeFileSync(chunkPath.replace('input/languages/', 'output/languages/'), JSON.stringify(chunk, null, 2), 'utf8');
}

applyTranslations('input/languages/bmd_chunks/bmd_chunk_3.json', bmd_chunk_3_map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_4.json', bmd_chunk_4_map);

console.log('Translated BMD Chunk 3 and 4 successfully!');
