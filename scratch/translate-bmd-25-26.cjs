const fs = require('fs');

const map = {
  // Chunk 25
  "BASIC SKILL. Rule #1 for survival. If you run out of Stamina, that's it. Can't fight, can't run away. You're done.": "KỸ NĂNG CƠ BẢN. Quy tắc số 1 để sinh tồn. Nếu hết Thể lực, xong đời. Không thể đánh đấm, không thể chạy trốn. Mày tèo chắc.",
  "Max. Stamina": "Thể Lực Tối Đa",
  "BASIC SKILL. When the shit hits the fan, you need to think fast. The quicker you can assess a situation, the better chance you have.": "KỸ NĂNG CƠ BẢN. Khi mọi chuyện trở nên tồi tệ, mày cần phải suy nghĩ thật nhanh. Càng đánh giá tình hình nhanh nhạy, cơ hội sống sót càng cao.",
  "10 seconds": "10 giây",
  "Scavenging Speed": "Tốc Độ Thu Thập",
  "BASIC SKILL. Sometimes the best defense is a lead pipe to the face. Other times, it's getting the hell out of the way.": "KỸ NĂNG CƠ BẢN. Đôi khi cách phòng thủ tốt nhất là phang ống tuýp sắt vào mặt kẻ thù. Nhưng cũng có lúc, tốt nhất là chạy thục mạng cho khuất mắt.",
  "Bonus Vitality": "Sinh Lực Tăng Thêm",
  "BASIC SKILL. Used to be shooting was just a hobby. Now it's a daily requirement.": "KỸ NĂNG CƠ BẢN. Bắn súng từng là một sở thích. Giờ thì nó là yêu cầu sống còn hàng ngày.",
  "Recoil Reduction": "Giảm Độ Giật",
  "PERSONAL SKILL. Just don't ask me to help you move furniture, okay?": "KỸ NĂNG CÁ NHÂN. Nhưng đừng có nhờ tao khuân vác đồ đạc, hiểu chứ?",
  "Killing Blow Chance": "Tỉ Lệ Đòn Kết Liễu",
  "PERSONAL SKILL. I'm quicker and more agile than most.": "KỸ NĂNG CÁ NHÂN. Tôi nhanh nhẹn và lanh lẹ hơn phần lớn mọi người.",
  "Stamina Regeneration": "Hồi Phục Thể Lực",
  "PERSONAL SKILL. People are inclined to listen to me and do what I say.": "KỸ NĂNG CÁ NHÂN. Mọi người có xu hướng nghe lời và làm theo những gì tôi bảo.",
  "Friendship Gain": "Tăng Tình Hữu Nghị",
  "PERSONAL SKILL. It's more than just nailing planks together. Construction's an art form, and I may not be Monet, but I know how to color inside the lines.": "KỸ NĂNG CÁ NHÂN. Nó không chỉ là đóng đinh các tấm ván lại với nhau. Xây dựng là một nghệ thuật, tôi có thể không phải là Monet, nhưng tôi biết cách tô màu sao cho không bị lem ra ngoài.",
  "PERSONAL SKILL. What's your poison? TexMex? Sushi? Indian/Guatemalan fusion? Or maybe just the perfect cheeseburger?": "KỸ NĂNG CÁ NHÂN. Thích món gì nào? TexMex? Sushi? Ẩm thực kết hợp Ấn Độ/Guatemala? Hay chỉ đơn giản là một chiếc bánh mì kẹp phô mai hoàn hảo?",
  "PERSONAL SKILL. No, no, no, I said an *Erlenmeyer* flask!": "KỸ NĂNG CÁ NHÂN. Không, không, không, tao đã bảo là bình nón *Erlenmeyer* cơ mà!",
  "PERSONAL SKILL. Sure, it's nice having a good cook or somebody that can keep the peace around, but a good medic's worth their weight in ammo. You know it, I know it.": "KỸ NĂNG CÁ NHÂN. Chắc chắn rồi, có một đầu bếp giỏi hay một người biết giữ hòa khí thì cũng tốt đấy, nhưng một y tá giỏi thì quý giá ngang ngửa đạn dược. Anh biết điều đó, và tôi cũng biết.",
  "PERSONAL SKILL. Plants aren't so different from us. Each one has its own needs, and if you don't tend to those needs they'll end up choking each other to death.": "KỸ NĂNG CÁ NHÂN. Cây cối cũng chẳng khác gì chúng ta. Mỗi loài có nhu cầu riêng, và nếu không chăm sóc cẩn thận, chúng sẽ chèn ép nhau đến chết.",
  "PERSONAL SKILL. You think all I do is read books all day? It's called Library *Science* for a reason, motherfuckers!": "KỸ NĂNG CÁ NHÂN. Chúng mày nghĩ tao rảnh rỗi chỉ biết cắm mặt vào sách cả ngày à? Người ta gọi đó là *Khoa Học* Thư Viện đều có lý do cả đấy, lũ khốn!",
  "PERSONAL SKILL. Yeah, yeah, I've heard all the jokes about sadistic gym teachers and sleazy personal trainers. See if you're laughing when I leave you in the dust with the dead.": "KỸ NĂNG CÁ NHÂN. Rồi rồi, tao nghe đủ mấy trò đùa mỉa mai về mấy gã giáo viên thể dục bạo dâm và huấn luyện viên cá nhân bệnh hoạn rồi. Để xem mày còn cười được không khi tao bỏ mày lại hít bụi cùng lũ xác sống.",
  "Fitness Guru": "Chuyên Gia Thể Hình",
  "PERSONAL SKILL. Now, let's everybody just calm down and talk this through, okay?": "KỸ NĂNG CÁ NHÂN. Giờ thì, tất cả bình tĩnh lại và nói chuyện đàng hoàng xem nào, được chứ?",
  "PERSONAL SKILL. Babe Ruth's batting average? .342. Ask me a tough one.": "KỸ NĂNG CÁ NHÂN. Tỉ lệ đánh bóng của Babe Ruth á? 0.342. Hỏi câu nào khó hơn đi.",

  // Chunk 26
  "Sports Trivia": "Kiến Thức Thể Thao",
  "PERSONAL SKILL. Did you hear about Mary Jo Bligh?": "KỸ NĂNG CÁ NHÂN. Anh đã nghe chuyện về Mary Jo Bligh chưa?",
  "PERSONAL SKILL. If there's a deal, I'll find it.": "KỸ NĂNG CÁ NHÂN. Ở đâu có kèo thơm, ở đó có tôi.",
  "PERSONAL SKILL. Man, that new solid-state drive I had on order is never gonna get here now....": "KỸ NĂNG CÁ NHÂN. Mẹ kiếp, cái ổ cứng SSD tao mới đặt hàng chắc chắn đéo bao giờ giao tới nơi được nữa rồi...",
  "Computer Skills": "Kỹ Năng Máy Tính",
  "PERSONAL SKILL. I wonder what happened to the Housemates?": "KỸ NĂNG CÁ NHÂN. Tự hỏi đám Bạn Cùng Nhà giờ ra sao rồi nhỉ?",
  "Reality Show Trivia": "Kiến Thức Truyền Hình Thực Tế",
  "PERSONAL SKILL. Coffee's for closers only.": "KỸ NĂNG CÁ NHÂN. Cà phê chỉ dành cho người biết chốt sale thôi.",
  "PERSONAL SKILL. God, I love money.": "KỸ NĂNG CÁ NHÂN. Chúa ơi, con yêu tiền.",
  "PERSONAL SKILL. It's okay, I can make anything look good.": "KỸ NĂNG CÁ NHÂN. Không sao, tôi có thể biến mọi thứ trở nên lộng lẫy.",
  "PERSONAL SKILL. American, British, Mexican, Korean--I don't care, I watch them all.": "KỸ NĂNG CÁ NHÂN. Mỹ, Anh, Mexico, Hàn Quốc--Tao đéo quan tâm, tao xem hết.",
  "Soap Opera Trivia": "Kiến Thức Phim Truyền Hình Dài Tập",
  "PERSONAL SKILL. Do you have a minute to discuss the use of symbolism in Anna Karenina?": "KỸ NĂNG CÁ NHÂN. Bạn có rảnh chút để thảo luận về việc sử dụng tính biểu tượng trong tác phẩm Anna Karenina không?",
  "PERSONAL SKILL. Come on, let's make a deal.": "KỸ NĂNG CÁ NHÂN. Thôi nào, hãy chốt kèo đi.",
  "PERSONAL SKILL. Wait, no, if I put the 9 there I've got no place for the 3!": "KỸ NĂNG CÁ NHÂN. Khoan đã, không, nếu tao điền số 9 vào đó thì đéo còn chỗ cho số 3!",
  "PERSONAL SKILL. I forget, do you drink when you miss a shot or when you make a shot? Oh well, let's drink!": "KỸ NĂNG CÁ NHÂN. Tao quên mẹ mất rồi, uống khi ném trượt hay ném trúng ấy nhỉ? Mặc xác đi, nhậu thôi!",
  "Beer Pong": "Ném Bóng Bàn Uống Bia",
  "PERSONAL SKILL. Hey, I might need that!": "KỸ NĂNG CÁ NHÂN. Này, tôi có thể cần cái đó đấy!",
  "PERSONAL SKILL. One does not use a dessert spoon to scoop up zombie brains.": "KỸ NĂNG CÁ NHÂN. Người ta đéo dùng thìa ăn tráng miệng để múc não thây ma đâu.",
  "PERSONAL SKILL. \"No white after Labor Day\" is just the beginning.": "KỸ NĂNG CÁ NHÂN. \"Không mặc đồ trắng sau Lễ Lao Động\" chỉ là phần mở đầu thôi.",
  "PERSONAL SKILL. Your Honor, I must object to opposing counsel's attempts to chew on my head.": "KỸ NĂNG CÁ NHÂN. Thưa Quý tòa, tôi phản đối nỗ lực nhai đầu tôi của luật sư đối phương.",
  "PERSONAL SKILL. I made you this friendship bracelet!": "KỸ NĂNG CÁ NHÂN. Tôi làm cho cậu chiếc vòng tay tình bạn này đấy!",
  "Arts and Crafts": "Nghệ Thuật Và Thủ Công",
  "PERSONAL SKILL. Let me just peep your digits.": "KỸ NĂNG CÁ NHÂN. Để tôi lướt qua mấy con số của anh một chút nào.",
  "Unlocks a new Skill, granting additional benefits and new Abilities with a specific type of weapon.": "Mở khóa Kỹ năng mới, cấp thêm lợi ích và Kỹ năng mới với một loại vũ khí cụ thể.",
  "Weapon Specialization": "Chuyên Môn Vũ Khí",
  "Blunt Training": "Huấn Luyện Vũ Khí Cùn",
  "Blade Training": "Huấn Luyện Vũ Khí Sắc Bén",
  "Pistol Training": "Huấn Luyện Súng Ngắn",
  "Rifle Training": "Huấn Luyện Súng Trường",
  "Assault Training": "Huấn Luyện Súng Tự Động",
  "Shotgun Training": "Huấn Luyện Súng Shotgun",
  "Unlocks one of two Special Attacks based on your Weapon Specialization.": "Mở khóa một trong hai Đòn Tấn Công Đặc Biệt dựa trên Chuyên Môn Vũ Khí của mày.",
  "Special Attack": "Đòn Tấn Công Đặc Biệt",
  "Unlocks a Special Technique based on your Core Skills.": "Mở khóa một Kỹ Thuật Đặc Biệt dựa trên các Kỹ Năng Cốt Lõi của mày.",
  "Special Technique": "Kỹ Thuật Đặc Biệt",
  "Combat Training": "Huấn Luyện Chiến Đấu",
  "Unlocks a more powerful replacement for the shove attack ([xi_use]).": "Mở khóa một đòn tấn công thay thế mạnh mẽ hơn cho đòn xô ngã ([xi_use]).",
  "Utility Skill": "Kỹ Năng Hỗ Trợ",
  "Unlocks a new special ability triggered by your defensive moves ([cover]).": "Mở khóa một kỹ năng đặc biệt mới được kích hoạt bởi các chiêu thức phòng thủ của mày ([cover]).",
  "Defensive Skill": "Kỹ Năng Phòng Thủ",
  "9 seconds": "9 giây",
  "8 seconds": "8 giây",
  "7 seconds": "7 giây",
  "6 seconds": "6 giây"
};

function applyTranslations(chunkPath, mapData) {
  if (!fs.existsSync(chunkPath)) return;
  const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  for (const r of chunk.replacements) {
    if (
      r.sourceText.includes('Trait.') || 
      r.sourceText.includes('Aptitude.') || 
      r.sourceText.includes('Action.') || 
      r.sourceText.includes('Status.') || 
      r.sourceText.includes('Game.') || 
      r.sourceText.includes('Character.') || 
      r.sourceText.includes('Count.') ||
      r.sourceText.includes('LOG:') ||
      r.sourceText.includes('Confidence.') ||
      r.sourceText.includes('Facility.') ||
      r.sourceText.includes('Item.') ||
      r.sourceText.includes('ItemType.') ||
      r.sourceText.includes('Freak.') ||
      r.sourceText.includes('OneShot.') ||
      r.sourceText.includes('Mastery.') ||
      r.sourceText.includes('BluntLightSpecial.') ||
      r.sourceText.includes('BluntHeavy.') ||
      r.sourceText.includes('EdgedLight.') ||
      r.sourceText.includes('Technique.') ||
      r.sourceText.includes('Strong.') ||
      r.sourceText.includes('Agile.') ||
      r.sourceText.startsWith('+') ||
      r.sourceText.startsWith('-') ||
      r.sourceText.startsWith('!') ||
      r.sourceText.startsWith('[hp_')
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

applyTranslations('input/languages/bmd_chunks/bmd_chunk_25.json', map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_26.json', map);
console.log('Translated BMD Chunk 25 and 26 successfully!');
