const fs = require('fs');

const map = {
  // Chunk 31
  "How long before the 5k zombie run becomes a real sport?": "Bao lâu nữa thì trò chạy bộ 5km né zombie mới trở thành một môn thể thao chính thức đây?",
  "Level 6": "Cấp 6",
  "All this Stamina and I didn't even have to dope! (Special Techniques: Marathon, Combat Endurance)": "Thể Lực dồi dào cỡ này mà tao còn đéo thèm xài doping cơ đấy! (Kỹ thuật đặc biệt: Chạy Marathon, Bền Bỉ Chiến Đấu)",
  "Level 7": "Cấp 7",
  "I'm getting better at casing stuff quickly.": "Tao đang ngày càng lục lọi nhanh hơn rồi đấy.",
  "Please, nobody ever keeps anything useful in the closet. It's all about the sock drawer.": "Thôi đi, đéo ai lại giấu đồ xịn trong tủ quần áo cả. Bí mật luôn nằm ở ngăn kéo đựng tất.",
  "Kitchen, bathroom, garage. The Holy Trinity of efficient scavenging.": "Nhà bếp, phòng tắm, nhà để xe. Bộ ba thánh địa của dân nhặt mót chuyên nghiệp.",
  "Just turn me loose in a room and I'll strip it to the copper in the walls.": "Cứ thả tao vào một căn phòng và tao sẽ cạy cho đến cọng đồng cuối cùng trong tường.",
  "Caution is key--now I'm less likely to break stuff when I search. (Special Technique: Ninja)": "Cẩn thận là trên hết--giờ tao ít làm hỏng đồ đạc hơn khi lục lọi. (Kỹ thuật đặc biệt: Ninja)",
  "No pain, no gain, right?": "Không đau đớn, không thành công, đúng không?",
  "Let's just say I don't cry when I stub my toe. Any more. (Weapon Specialization available)": "Nói thế này cho vuông, giờ tao đéo còn khóc nhè mỗi khi vấp ngón chân nữa đâu. (Đã có thể chọn Chuyên Môn Vũ Khí)",
  "Barefoot in the snow, uphill both ways, etc. etc.": "Đi chân trần trong tuyết, leo dốc cả đi lẫn về, vân vân và mây mây.",
  "No, I'm not going to make a Black Knight joke here. Shut up.": "Không, tao sẽ đéo lôi trò đùa Hắc Hiệp Sĩ ra ở đây đâu. Ngậm mẹ mồm vào.",
  "I am become Shiva, destroyer of zombies. (Special Technique: Rage)": "Tao đã trở thành Shiva, kẻ hủy diệt zombie. (Kỹ thuật đặc biệt: Phẫn Nộ)",
  "The trick is to squeeze the trigger, not jerk it.": "Bí quyết là phải bóp cò từ từ, chứ đừng có giật cục.",
  "My hands are greased lightning. I'm faster while aiming, I reload quicker, and I can lock in on a zombie's head from even farther away. (Special Technique: Focus Aim)": "Tay tao nhanh như chớp. Nhắm bắn nhanh hơn, nạp đạn lẹ hơn, và khóa sọ zombie từ khoảng cách xa hơn nữa. (Kỹ thuật đặc biệt: Ngắm Bắn Tập Trung)",
  "I bench press more than my body weight, if that's what you mean.": "Tao đẩy ngực được khối lượng nặng hơn cả cơ thể mình đấy, nếu mày muốn biết.",
  "When I shove somebody, they move. (Class Specializations: Power Push, Power Kick)": "Khi tao đẩy ai đó, chúng nó chỉ có nước văng ra xa. (Chuyên Môn Chức Nghiệp: Xô Ngã, Cú Đá Ngàn Cân)",
  "You want two halves of a phone book? I've got a lot lying around.": "Mày có muốn tao xé đôi cuốn danh bạ điện thoại không? Xung quanh đây thiếu đéo gì.",
  "Survivor smash!": "Kẻ Sinh Tồn đập phá!",
  "Nope, it's all natural. Shut up.": "Đéo, cơ bắp tao tự nhiên 100%. Im mồm đi.",
  "I could keep this up all day!": "Tao có thể làm thế này cả ngày cũng đéo thấy mệt!",
  "Too slow, Mr. Zombie! (Class Specializations: Spin Kick, Sweep)": "Quá chậm rồi, ngài Zombie! (Chuyên Môn Chức Nghiệp: Đá Xoay, Đá Quét)",
  "Just give me a second to catch my breath, and I'll be fine.": "Cho tao một giây để thở cái đã, rồi tao sẽ ổn thôi.",
  "You know what they say about butterflies and bees, right?": "Mày biết người ta hay nói gì về ong với bướm mà, đúng không?",
  "\"Dodge this?\" Don't mind if I do!": "\"Né cái này xem?\" Đéo thành vấn đề!",
  "Trust me.": "Tin tao đi.",
  "I know what I'm doing.": "Tao biết tao đang làm gì.",
  "Nice of you to see things my way.": "Rất vui vì mày đã chịu hiểu theo cách của tao.",
  "Follow my lead!": "Theo tao!",
  "I've gotten us out of worse spots than this, right? Just stick with me.": "Tao đã đưa chúng ta thoát khỏi những tình huống còn tồi tệ hơn thế này nhiều, đúng không? Cứ bám sát tao là được.",
  "When this is all over, I should run for President!": "Khi mọi chuyện kết thúc, tao nên ứng cử chức Tổng thống cmnl!",
  "Face, meet bat.": "Mặt này, làm quen với gậy bóng chày đi.",
  "I think that made quite an... impression. Get it? Guys?": "Tao nghĩ cú đó vừa tạo ra một... ấn tượng sâu sắc đấy. Hiểu không? Mấy đứa?",
  "Bonk! (Weapon Specializations: Uppercut, Spinning Backhand)": "Bốp! (Chuyên Môn Vũ Khí: Đấm Móc, Đánh Xoay Tay Trái)",
  "Don't get so bent out of shape, they're zombies, not baby seals.": "Đừng có tỏ vẻ thương xót thế, chúng nó là zombie, đéo phải mấy con hải cẩu con đâu.",
  "Who needs a gun? Clubs don't run out of ammo.": "Ai thèm dùng súng chứ? Gậy thì làm đéo gì có chuyện hết đạn.",
  "Just call me \"Skullcrusher.\" ... Please?": "Cứ gọi tao là \"Kẻ Nghiền Sọ.\" ... Nhé?",
  "How am I looking? ...Sharp.": "Trông tao thế nào? ...Sắc bén chứ.",
  "Don't make me have to cut a zed.": "Đừng ép tao phải lôi dao ra chém zombie chứ.",
  "Slice! (Weapon Specializations: Low Slice, Behead)": "Chém! (Chuyên Môn Vũ Khí: Chém Thấp, Chém Đầu)",
  "Dice!": "Thái nhỏ!",
  "Julienne!": "Thái sợi!",
  "Chiffonade! (Yes, it's a real word. Shut up.)": "Chiffonade! (Ừ, tao biết xài từ lóng đầu bếp đấy. Ngậm mồm lại đi.)",
  "Feel the burn! And the squish.": "Cảm nhận sự rát bỏng đi! Và cả tiếng nhầy nhụa nữa.",
  "Why go for speed when you can have raw, brute force?": "Sao phải cần tốc độ khi mày đã có thứ sức mạnh hoang dã, thuần túy này chứ?",
  "It IS true that there's a place you can hit a zombie so its head will explode! (Weapon Specializations: Sweep, Spin)": "Sự thật LÀ có một chỗ mày có thể đánh trúng zombie khiến đầu nó nổ tung! (Chuyên Môn Vũ Khí: Quét, Xoay)",
  "Overkill? No such thing.": "Hành hạ thái quá à? Đéo có khái niệm đó đâu.",
  "There's something comforting in carrying a weapon that weighs as much as a small child.": "Cảm giác cầm một món vũ khí nặng ngang một đứa trẻ con thật là an tâm làm sao.",
  "When everything looks like a nail, sooner or later you need a really big hammer.": "Khi nhìn đâu cũng thấy đinh, thì sớm muộn gì mày cũng cần một cái búa thật to.",
  "Light, portable, and efficient. Just like me.": "Nhẹ, gọn, và hiệu quả. Y chang tao vậy.",
  "You have no idea how many times an extra round in the chamber has saved my ass.": "Mày đéo biết được đã bao nhiêu lần một viên đạn dự phòng trong buồng đạn cứu mạng tao đâu.",
  "You know they make pistols you can take through airport metal detectors now? Not that that's really relevant any more.": "Mày có biết giờ người ta làm ra loại súng ngắn lọt qua được máy dò kim loại ở sân bay không? Dù sao thì chuyện đó giờ cũng đéo còn quan trọng nữa.",
  "Pro shooters do it in the Weaver Stance.": "Dân bắn súng chuyên nghiệp luôn dùng tư thế Weaver.",
  "Did I fire six shots, or just five? Doesn't matter, the mag holds 12.": "Tao vừa bắn sáu phát, hay chỉ mới năm? Đéo quan trọng, băng đạn có tận 12 viên cơ mà.",
  "Next time I kill a zombie, release this cote full of doves behind me, okay?": "Lần tới tao giết zombie, thả giùm tao đàn bồ câu phía sau làm phông nền nhé, ok?",
  "The trusty Saturday Night Special. Just as handy on Sundays.": "Khẩu súng lục ổ quay thứ Bảy đáng tin cậy. Dùng vào Chủ Nhật cũng tiện phết.",
  "Reach for it, Mister!": "Giơ tay lên, tên kia!",
  "My mama always said these things were the Devil's right hand.": "Mẹ tao luôn bảo mấy thứ này là cánh tay phải của Ác Quỷ.",
  "Just once I'd like to have a showdown at high noon....": "Chỉ một lần thôi tao cũng muốn được quyết đấu giữa ban ngày ban mặt....",
  "Did I fire six shots, or just five?": "Tao vừa bắn sáu phát, hay chỉ mới năm viên?",
  "I'm your huckleberry.": "Tao chính là người mày cần tìm đây.",
  "You get up close if you want; me, I'll stick to killing zombies from as far away as possible.": "Mày muốn xông vào cận chiến thì tùy; còn tao, tao thích giết zombie từ xa tít mù tắp.",
  "LEVEL 4. Reloading a gun always looks so easy in the movies. Took me a while to get the hang of it. I'm so much more efficient now.": "CẤP 4. Nạp đạn trên phim nhìn lúc đéo nào cũng dễ. Tao đã phải mất một khoảng thời gian mới quen tay được. Giờ thì tao thao tác mượt hơn nhiều rồi.",
  "Damn shame there's no more biathalons. I'd clean up.": "Tiếc thật, đéo còn giải đấu hai môn phối hợp nào nữa. Tao mà thi là càn quét hết giải.",
  "Have rifle, will travel.": "Có súng trường trong tay, đi đâu cũng được.",
  "When it comes to putting bullets in zombies, I've got three words: quantity, quantity, lots of bullets.": "Khi nói đến việc nhét kẹo đồng vào đầu zombie, tao chỉ có ba từ: số lượng, số lượng, và thật nhiều đạn.",
  "Aw, yeah, we're talking military-grade destruction here.": "Ố ồ, chuẩn rồi, chúng ta đang nói tới sức tàn phá cấp độ quân đội đấy.",
  "Sure it bucks like a donkey with a bee under its saddle, but it's just so satisfying!": "Công nhận nó giật như một con lừa bị ong đốt vào đít, nhưng bắn đã tay vãi lồn!",
  "Let's see anybody ban these bad boys now!": "Đéo ai dám cấm mang mấy món hàng nóng này nữa đâu!",
  "These things burn through clips like you wouldn't believe. So carry lots of clips.": "Mấy khẩu này ngốn đạn nhanh kinh khủng. Nhớ mang theo nhiều băng đạn vào.",
  "What do you mean, \"lowest bidder?\"": "Mày nói \"kẻ bỏ thầu thấp nhất\" là ý đéo gì?",
  "Don't rack the slide when there's a shell in the chamber. It makes you look like a jackass.": "Đừng có lên nòng khi đã có đạn trong buồng sẵn rồi. Nhìn mày giống hệt thằng ngu đấy.",
  "The trick is to not panic, just feed the shells in one by one.": "Bí quyết là đéo được hoảng, cứ bình tĩnh nhét từng viên đạn vào một.",
  "Nothing like pulling the trigger and seeing a whole pack of zombies fall down.": "Đéo có gì sướng bằng việc bóp cò và chứng kiến nguyên bầy zombie rụng như sung.",
  "Have you ever seen what double-aught buckshot can do to a zombie's head at close range?": "Mày đã bao giờ thấy đạn chùm làm gì với sọ của một con zombie ở khoảng cách gần chưa?",
  "In the old days they'd fill shotguns with nails, bits of glass, rocks, whatever they could get their hands on. Bet that'd ruin a zombie's day.": "Ngày xưa người ta hay nhét đinh, mảnh chai, đá tảng, hay bất cứ thứ đéo gì họ nhặt được vào shotgun. Tao cá là món đó sẽ làm hỏng bét ngày vui của lũ zombie đấy.",
  "\"12 gauge\" is \"I love you\" in Survivor.": "\"Shotgun nòng cỡ 12\" chính là cách nói \"Tao yêu mày\" của Dân Sinh Tồn đấy.",

  // Chunk 32
  "Some things (like a Garden) can't be built indoors.": "Một số thứ (như Khu Vườn) đéo thể xây trong nhà được.",
  "We could put just about anything here as long as we put a tent over it.": "Chúng ta có thể đặt gần như bất cứ thứ gì ở đây miễn là dựng cái lều che lên.",
  "We could set up a watchtower here.": "Chúng ta có thể dựng một tháp canh ở đây.",
  "An empty socket": "Một ô trống",
  "Empty Socket": "Ô Trống",
  "Radio broadcasts can be used to coordinate our efforts, reach out to other survivors, and to provide hope.": "Chương trình phát thanh có thể dùng để điều phối hoạt động, liên lạc với những người sống sót khác, và thắp lên hy vọng.",
  "Radio Room": "Phòng Vô Tuyến",
  "A place to make the things we need.": "Nơi để chế tạo những thứ chúng ta cần.",
  "Basic Workshop": "Xưởng Cơ Bản",
  "+100% construction rate. REQUIRES TOOLS EXPERT.": "+100% tốc độ xây dựng. YÊU CẦU CHUYÊN GIA MÁY MÓC.",
  "A workshop to focus on making explosives and incendiaries.": "Một xưởng tập trung vào việc chế tạo thuốc nổ và đạn cháy.",
  "Munitions Shop": "Xưởng Đạn Dược",
  "A workshop focused on construction and car repair.": "Một xưởng tập trung vào xây dựng và sửa chữa xe cộ.",
  "Machine Shop": "Xưởng Cơ Khí",
  "Built In Workshop": "Xưởng Xây Sẵn",
  "A top-notch workshop with a wide variety of tools and equipment.": "Một xưởng chế tạo đỉnh cao với đủ loại công cụ và thiết bị.",
  "Snyder Machine Shop": "Xưởng Cơ Khí Snyder",
  "Somewhere to sleep.": "Một chỗ để ngủ.",
  "Sleeping Area": "Khu Vực Ngủ",
  "A mostly unfurnished sleeping area of cots and futons.": "Một khu vực ngủ hầu như chẳng có đồ đạc gì ngoài mấy cái giường gấp và nệm.",
  "A dorm area with beds.": "Một khu ký túc xá có giường đàng hoàng.",
  "A built-in sleeping area.": "Khu vực ngủ xây sẵn.",
  "Built In Bunkhouse": "Nhà Trọ Xây Sẵn",
  "A bunkhouse for laborers.": "Khu nhà trọ dành cho dân lao động.",
  "For medical treatment.": "Dùng để điều trị y tế.",
  "Medical Area": "Khu Y Tế",
  "Improves Vitality. Increases the chance of Recovery from injuries and illness each day.": "Cải thiện Máu. Tăng cơ hội Phục hồi từ chấn thương và bệnh tật mỗi ngày.",
  "All the benefits of an Infirmary, plus the ability to create Stimulants. REQUIRES LIBRARY.": "Có mọi lợi ích của Bệnh Xá, cộng thêm khả năng chế tạo Thuốc Kích Thích. YÊU CẦU THƯ VIỆN.",
  "Medical Lab": "Phòng Thí Nghiệm Y Tế",
  "Built In Medical Area": "Khu Y Tế Xây Sẵn",
  "To improve our fitness and combat skills.": "Để cải thiện thể lực và kỹ năng chiến đấu của chúng ta.",
  "Having a clean area for food improves health and protects against illness. REQUIRES WORKSHOP.": "Có một khu vực sạch sẽ để ăn uống giúp cải thiện sức khỏe và phòng ngừa bệnh tật. YÊU CẦU XƯỞNG CHẾ TẠO.",
  "Having a clean area for food improves health and protects against illness.": "Có một khu vực sạch sẽ để ăn uống giúp cải thiện sức khỏe và phòng ngừa bệnh tật.",
  "Alamo Kitchen": "Nhà Bếp Alamo",
  "Farmhouse Kitchen": "Nhà Bếp Nông Trại",
  "Church Kitchen": "Nhà Bếp Nhà Thờ",
  "Fairgrounds Snack Shop": "Quầy Ăn Vặt Hội Chợ",
  "Increased space for resources.": "Tăng cường không gian chứa tài nguyên.",
  "Storage Area": "Khu Lưu Trữ",
  "Food Storage": "Kho Thực Phẩm",
  "Refrigerated Storage": "Kho Lạnh",
  "Storage Room": "Phòng Lưu Trữ",
  "Alamo Food Storage": "Kho Thực Phẩm Alamo",
  "Farmhouse Food Storage": "Kho Thực Phẩm Nông Trại",
  "Warehouse Storage": "Kho Hàng Ký Gửi",
  "Fairgrounds Storage": "Kho Hàng Hội Chợ",
  "Pastor's Quarters": "Nơi Ở Của Mục Sư",
  "Warehouse Lockers": "Tủ Đồ Kho Hàng",
  "Fairgrounds Lockers": "Tủ Đồ Hội Chợ",
  "A place to grow fresh food. Just getting started.": "Một nơi để trồng thực phẩm tươi. Chỉ mới bắt đầu thôi.",
  "A place to grow fresh food. Coming along nicely.": "Một nơi để trồng thực phẩm tươi. Đang phát triển khá tốt.",
  "A place to grow fresh food. A thriving crop!": "Một nơi để trồng thực phẩm tươi. Vụ mùa bội thu!"
};

function applyTranslations(chunkPath, mapData) {
  if (!fs.existsSync(chunkPath)) return;
  const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  for (const r of chunk.replacements) {
    if (
      r.sourceText.includes('Status.') || 
      r.sourceText.includes('Facility.') || 
      r.sourceText.includes('Variant.') || 
      r.sourceText.includes('Indoor,') || 
      r.sourceText.includes('Outdoor,') || 
      r.sourceText.includes('NoStaff,') || 
      r.sourceText.includes('Socket In') || 
      r.sourceText.includes('Socket Out') || 
      r.sourceText.includes('ranger.') || 
      r.sourceText.match(/^[0-9\.]+$/) || 
      r.sourceText.match(/^[\+\-][0-9\.]+%?$/)
    ) {
      if (r.sourceText === "+100% construction rate. REQUIRES TOOLS EXPERT.") {
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

applyTranslations('input/languages/bmd_chunks/bmd_chunk_31.json', map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_32.json', map);
console.log('Translated BMD Chunk 31 and 32 successfully!');
