const fs = require('fs');

const map = {
  // Chunk 27
  "Master the use of Blunt Weapons.": "Bậc thầy sử dụng Vũ Khí Cùn.",
  "Blunt Weapons": "Vũ Khí Cùn",
  "Knockdown Chance": "Tỉ Lệ Đánh Ngã",
  "Master the use of Edged Weapons.": "Bậc thầy sử dụng Vũ Khí Có Lưỡi.",
  "Edged Weapons": "Vũ Khí Có Lưỡi",
  "Chance to Decapitate": "Tỉ Lệ Chém Đầu",
  "Master the use of Heavy Weapons.": "Bậc thầy sử dụng Vũ Khí Hạng Nặng.",
  "Heavy Weapons": "Vũ Khí Hạng Nặng",
  "Mighty Blow Chance": "Tỉ Lệ Đòn Đánh Mạnh",
  "Master the use of Pistols.": "Bậc thầy sử dụng Súng Ngắn.",
  "Rate of Fire": "Tốc Độ Bắn",
  "Master the use of Revolvers.": "Bậc thầy sử dụng Súng Lục Ổ Quay.",
  "Stopping Power": "Sức Mạnh Lực Cản",
  "Master the use of Rifles.": "Bậc thầy sử dụng Súng Trường.",
  "Target Snap Distance": "Khoảng Cách Bắt Mục Tiêu",
  "Master the use of Assault Weapons. (Rifles and SMGs)": "Bậc thầy sử dụng Vũ Khí Tự Động. (Súng Trường và Tiểu Liên)",
  "Assault Weapons": "Vũ Khí Tự Động",
  "Master the use of Shotguns.": "Bậc thầy sử dụng Súng Shotgun.",
  "Kill Zone Size": "Kích Thước Vùng Sát Thương",
  "A powerful attack that knocks enemies down.": "Một đòn tấn công mạnh mẽ đánh ngã kẻ thù.",
  "A special attack that hits everything in a large area in front of you.": "Một đòn tấn công đặc biệt đánh trúng mọi thứ trong một khu vực rộng phía trước mặt mày.",
  "Spinning Backhand": "Đánh Xoay Tay Trái",
  "A special attack that hits everything in a wide area in front of you, with a chance to trip or dismember.": "Một đòn tấn công đặc biệt đánh trúng mọi thứ trong khu vực rộng trước mặt, có tỉ lệ gạt giò hoặc chặt đứt tứ chi.",
  "Slow attack that hits all enemies around you and knocks them down.": "Đòn tấn công chậm đánh trúng mọi kẻ thù xung quanh mày và hất ngã chúng.",
  "Special attack that dismembers the target's leg.": "Đòn tấn công đặc biệt chặt đứt chân mục tiêu.",
  "Low Slice": "Chém Thấp",
  "Slow attack that automatically decapitates a single target.": "Đòn tấn công chậm tự động chém bay đầu một mục tiêu.",
  "You're used to running long distances without tiring. Sprinting drains your Stamina 50% slower.": "Mày đã quen với việc chạy đường dài mà không biết mệt. Chạy nước rút sẽ làm giảm lượng Thể Lực hao hụt đi 50%.",
  "Decreases the rate at which you lose Stamina in combat.": "Giảm tốc độ hao hụt Thể Lực trong chiến đấu.",
  "Combat Endurance": "Bền Bỉ Chiến Đấu",
  "Removes locked doors and makes searching silent. Also lets you move faster while sneaking.": "Phá khóa cửa và giúp cho việc tìm kiếm trở nên im lặng. Đồng thời cho phép di chuyển nhanh hơn khi lén lút.",

  // Chunk 28
  "Gives you a small amount of Stamina back when you kill an enemy in melee.": "Hồi lại một lượng nhỏ Thể Lực khi mày kết liễu kẻ thù bằng đòn cận chiến.",
  "Intense concentration makes the world around you slow to a crawl as you line up the perfect shot.": "Sự tập trung cao độ khiến thế giới xung quanh mày chậm lại như rùa bò, giúp mày ngắm bắn một cách hoàn hảo nhất.",
  "Focus Aim": "Ngắm Bắn Tập Trung",
  "Slow shove guaranteed to knock enemies down.": "Cú xô chậm chạp nhưng chắc chắn sẽ làm kẻ thù ngã gục.",
  "Powerful kick that knocks back and staggers the target.": "Cú đá mạnh mẽ đẩy lùi và làm choáng váng mục tiêu.",
  "Power Kick": "Cú Đá Ngàn Cân",
  "Powerful spinning kick that knocks down a target.": "Cú đá xoay uy lực đánh gục mục tiêu.",
  "Spin Kick": "Cú Đá Xoay",
  "Area attack that has a high chance to trip targets.": "Đòn tấn công diện rộng có tỉ lệ cao gạt ngã mục tiêu.",
  "Sweep Kick": "Cú Đá Quét",
  "Special counter that lets you bodyslam enemies.": "Đòn phản công đặc biệt cho phép mày vật ngã kẻ thù.",
  "Pro Wrestling": "Đô Vật Chuyên Nghiệp",
  "Special counter that kills two nearby enemies.": "Đòn phản công đặc biệt kết liễu hai kẻ thù gần đó.",
  "Double Kill": "Hạ Gục Kép",
  "Special counter that lets you jump over an enemy and knock it to its knees.": "Đòn phản công đặc biệt cho phép mày nhảy qua đầu kẻ thù và quật ngã chúng.",
  "Special technique that allows you to instantly counter incoming attacks.": "Kỹ thuật đặc biệt cho phép mày ngay lập tức phản đòn các cuộc tấn công sắp tới.",
  "Instant Counter": "Phản Đòn Chớp Nhoáng",
  "Build up your Cardio the old fashioned way: run. A lot.": "Cải thiện Thể Lực theo cách cổ điển: chạy. Chạy thật nhiều vào.",
  "Hold [sprint] to sprint. Press [jump] to climb or vault objects. Sprint into doors to smash them open.": "Giữ [sprint] để chạy nước rút. Nhấn [jump] để leo trèo hoặc nhảy qua vật cản. Chạy lao thẳng vào cửa để húc tung chúng.",
  "The Basics": "Những Điều Cơ Bản",
  "XP penalty from ????": "Bị trừ XP từ ????",
  "XP penalty from Bad Lungs.": "Bị trừ XP do Phổi Kém.",
  "XP penalty from A Pack a Day.": "Bị trừ XP do Hút Thuốc Cả Gói Mỗi Ngày.",
  "Sharpen your Wits by searching and scavenging.": "Mài giũa Trí Tuệ bằng cách tìm kiếm và thu thập đồ đạc.",
  "Hold [xi_use] to search. Hold [sprint] + [xi_use] to search faster, but make more noise.": "Giữ [xi_use] để tìm kiếm. Giữ [sprint] + [xi_use] để tìm kiếm nhanh hơn, nhưng sẽ gây ra nhiều tiếng ồn.",
  "XP penalty from Dim Bulb.": "Bị trừ XP do Đầu Đất.",
  "XP penalty from Drunk.": "Bị trừ XP do Nát Rượu.",
  "XP penalty from Absent-Minded.": "Bị trừ XP do Đãng Trí.",
  "XP bonus from Library!": "Thêm XP nhờ Thư Viện!",
  "Crush the skull, cleave the brain, sever the head. Keep at it and in no time you'll be a Self-Defense expert.": "Nghiền nát sọ, bổ đôi não, chặt đứt đầu. Cứ làm thế và chẳng mấy chốc mày sẽ thành chuyên gia Tự Vệ.",
  "Press [ul_melee_attack] to attack. Press [cover] to dodge. Press [xi_use] to kick zombies away. Press [jump] for a leaping attack. Hold [sprint] for additional moves.": "Nhấn [ul_melee_attack] để tấn công. Nhấn [cover] để né tránh. Nhấn [xi_use] để đá văng lũ zombie. Nhấn [jump] để nhảy lên tấn công. Giữ [sprint] cho các chiêu thức bổ sung.",
  "XP penalty from Coward.": "Bị trừ XP do Hèn Nhát.",
  "XP penalty from Two Left Feet.": "Bị trừ XP do Hậu Đậu.",
  "Bonus XP from Fast Hands!": "Thêm XP nhờ Nhanh Tay!",
  "Bonus XP from Dojo!": "Thêm XP nhờ Võ Đường!",
  "One in the head, you know they're dead. And you get better at Shooting.": "Một viên vào đầu, chắc chắn chúng tèo. Và kỹ năng Bắn Súng của mày cũng sẽ lên tay.",
  "Hold [ul_aim] to aim a firearm, then press [ul_shoot] to fire. Hold down [ul_shoot] to fire automatic weapons. While aiming, press [aim.reload] to reload.": "Giữ [ul_aim] để ngắm súng, sau đó nhấn [ul_shoot] để bắn. Giữ chặt [ul_shoot] để xả súng tự động. Khi đang ngắm, nhấn [aim.reload] để nạp đạn.",
  "While aiming ([ul_aim]), press [firemode] to cycle rate of fire (automatic weapons only), or press [camera] to toggle zoom (scoped guns) or switch shoulder (non-scoped guns).": "Trong khi ngắm ([ul_aim]), nhấn [firemode] để thay đổi chế độ bắn (chỉ dành cho súng tự động), hoặc nhấn [camera] để phóng to (với súng có ống ngắm) hay đổi vai ngắm (với súng không ống ngắm).",
  "Advanced Shooting": "Bắn Súng Nâng Cao",
  "Bonus XP from Eagle-Eyed!": "Thêm XP nhờ Mắt Diều Hâu!",
  "Bonus XP from Shooting Platform!": "Thêm XP nhờ Chòi Bắn Tỉa!",
  "A Powerhouse wades into the middle of 'em and mixes it up hand-to-hand.": "Một Gã Khổng Lồ lao thẳng vào giữa đám đông và tả xung hữu đột bằng tay không.",
  "You can carry more weight in your pack before becoming encumbered.": "Mày có thể mang theo nhiều đồ nặng hơn trong ba lô trước khi bị quá tải.",
  "Strong Back": "Lưng Dài Vai Rộng",
  "You can carry more items per stack.": "Mày có thể mang được nhiều món đồ hơn trong mỗi ô hành lý.",
  "Pack Mule": "Con La Chở Hàng",
  "Reduced stamina penalty when using heavy weapons, and you can swing them a bit easier.": "Giảm mức độ hao hụt thể lực khi dùng vũ khí hạng nặng, và mày có thể vung chúng dễ dàng hơn một chút.",
  "Increased mobility and control when using large machine guns.": "Tăng cường độ cơ động và khả năng kiểm soát khi sử dụng súng máy cỡ lớn.",
  "Big Guns": "Súng Máy Hạng Nặng",
  "If you want quicker Reflexes, you've got to take the fight up close and personal.": "Nếu mày muốn có Phản Xạ nhanh hơn, mày phải sẵn sàng cho những trận chiến giáp lá cà.",
  "A Gifted Leader leads from the front lines, getting into the thick of it with their people and encouraging others to be their best.": "Một Nhà Lãnh Đạo Tài Ba luôn dẫn đầu trên tiền tuyến, xông pha vào nơi nguy hiểm nhất cùng với đồng đội và khích lệ họ phát huy hết khả năng.",
  "You want to learn the ropes, you need on-the-job training or a good trade school. Neither's really around any more.": "Mày muốn học hỏi kinh nghiệm thì cần được đào tạo thực tế hoặc học ở một trường dạy nghề tử tế. Mà giờ thì đéo còn cái nào tồn tại nữa đâu.",
  "Dramatically decreases construction and upgrade times for facilities.": "Giảm đáng kể thời gian xây dựng và nâng cấp các cơ sở vật chất.",
  "Construction Expert": "Chuyên Gia Xây Dựng",
  "Allows Workshop to be upgraded to Machine Shop.": "Cho phép Xưởng Chế Tạo được nâng cấp thành Xưởng Cơ Khí.",
  "Tool Knowledge": "Kiến Thức Máy Móc",
  "Skills like these you gotta acquire by attending a fancy culinary school--or burning a lot of food. Either way, it's not happening now.": "Những kỹ năng thế này mày phải học qua các trường ẩm thực danh giá--hoặc tự nấu cháy khét hàng đống đồ ăn. Đằng nào thì giờ cũng đéo còn trường nào để mà học đâu.",
  "Allows you to prepare Feasts in your Kitchen.": "Cho phép mày chuẩn bị các Bữa Tiệc Thịnh Soạn trong Nhà Bếp.",
  "These are not the kind of skills you acquire by amateur experimentation, and good luck finding an accredited university out there.": "Đây đéo phải loại kỹ năng mày có thể học lỏm bằng vài trò thử nghiệm nghiệp dư, và chúc may mắn tìm được cái trường đại học nào còn sáng đèn ngoài kia.",
  "Allows upgrade of Workshop to Munitions Shop.": "Cho phép nâng cấp Xưởng Chế Tạo thành Xưởng Đạn Dược.",
  "Chem Lab": "Phòng Thí Nghiệm Hóa Học",
  "Prevents mishaps when making explosives.": "Ngăn ngừa các tai nạn nổ tung xác khi chế tạo thuốc nổ.",
  "Safety First": "An Toàn Là Trên Hết",
  "Yeah, right. You don't spend years studying, you might as well be telling people to swallow live spiders to cure their cough.": "Ừ, đúng rồi. Nếu mày không dành hàng năm trời để học hành tử tế, thì mày cũng chỉ giống như bọn thầy lang khuyên người ta nuốt nhện sống để chữa ho mà thôi.",
  "Allows you to upgrade an Infirmary to a Medical Lab.": "Cho phép mày nâng cấp Bệnh Xá thành Phòng Thí Nghiệm Y Tế.",
  "Lab Work": "Nghiên Cứu Y Khoa",
  "Can save patients who would otherwise perish.": "Có thể cứu sống những bệnh nhân tưởng chừng như đã nắm chắc cái chết.",
  "Takes years of experience or a good botanical education to really understand plants like this. It's not something you pick up in a day or two.": "Cần nhiều năm kinh nghiệm hoặc qua một khóa đào tạo thực vật học bài bản để thực sự hiểu rõ những loại cây này. Đéo phải thứ mày học lỏm trong một hai ngày là được.",
  "Provides a chance of doubled output from your Garden.": "Tạo cơ hội nhân đôi sản lượng thu hoạch từ Khu Vườn của mày.",
  "Bumper Crop": "Bội Thu",
  "Look, it's a lot more complicated than just grabbing stuff off shelves and hoping you get lucky. You've got to know filing systems, interlibrary loans.... and none of that really exists any more, does it?": "Nghe này, mọi chuyện phức tạp hơn nhiều so với việc chỉ việc vớ đại đống đồ trên kệ rồi thầm cầu nguyện. Mày phải biết hệ thống lưu trữ, mượn sách liên thư viện... mà giờ thì mấy thứ đó đéo còn tồn tại nữa, đúng không?",
  "Collects notes on survival techniques, giving everyone a boost to Wits XP for the week.": "Thu thập các ghi chép về kỹ năng sinh tồn, giúp tăng XP Trí Tuệ cho mọi người trong suốt một tuần.",
  "Survival Handbook": "Cẩm Nang Sinh Tồn",
  "Dramatically speeds up research projects.": "Tăng tốc độ cho các dự án nghiên cứu lên đáng kể.",
  "Scientific Principles": "Nguyên Lý Khoa Học",
  "You'd be surprised how much time and specialized equipment you need to get good at this. Too bad both are in short supply.": "Mày sẽ phải ngạc nhiên khi biết cần bao nhiêu thời gian và thiết bị chuyên dụng để giỏi việc này. Đen cái là cả hai thứ đó giờ đều hiếm như vàng.",
  "Allows establishment of a Fitness Regimen.": "Cho phép thiết lập một Chế Độ Tập Luyện Thể Lực.",
  "Feel the Burn": "Vắt Kiệt Sức Lực",
  "It's surprisingly hard to cultivate patience and understanding when you're caroming from crisis to crisis.": "Khá là khó để giữ được sự kiên nhẫn và thấu hiểu khi mà mày cứ bị vùi dập từ cuộc khủng hoảng này sang cuộc khủng hoảng khác.",
  "Reduces the chances of violent arguments.": "Giảm thiểu nguy cơ xảy ra các cuộc cãi vã bạo lực.",
  "Break It Up": "Giải Tán Đi",
  "Reduces the chances of suicides.": "Giảm thiểu nguy cơ tự sát.",
  "Suicide Hotline": "Đường Dây Nóng Hỗ Trợ Tâm Lý",
  "Reduces the chances of characters fleeing in panic.": "Giảm thiểu nguy cơ các nhân vật hoảng loạn bỏ trốn.",
  "You Gotta Believe": "Mày Phải Có Niềm Tin",
  "Increases likelihood of penalties on opposing team.": "Tăng khả năng bị phạt đối với đội đối phương.",
  "Are You Blind, Ump?": "Mù À Trọng Tài?",
  "+25% scoring.": "+25% tỉ lệ ghi bàn.",
  "League Champion": "Nhà Vô Địch Giải Đấu",
  "Rumors spread 20% faster.": "Tin đồn lan truyền nhanh hơn 20%.",
  "You Didn't Hear This From Me...": "Tao Chưa Nói Gì Đâu Nhé...",
  "Buy one get one on merchandise at all stores.": "Mua một tặng một cho mọi món đồ ở tất cả các cửa hàng.",
  "Extreme Couponing": "Săn Mã Giảm Giá Siêu Cấp",
  "Doubles quantity of all purchases.": "Nhân đôi số lượng cho mọi món hàng mày mua.",
  "Buy in Bulk": "Mua Sỉ"
};

function applyTranslations(chunkPath, mapData) {
  if (!fs.existsSync(chunkPath)) return;
  const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  for (const r of chunk.replacements) {
    // Filter numbers and tags
    if (
      r.sourceText.includes('Status.') || 
      r.sourceText.includes('Trait.') || 
      r.sourceText.includes('OneShot.') || 
      r.sourceText.includes('Item.') || 
      r.sourceText.includes('Counter.') || 
      r.sourceText.includes('Freak.') || 
      r.sourceText.match(/^[0-9\.]+$/) || // Only numbers and dots
      r.sourceText.match(/^[\+\-][0-9\.]+%?$/) // +50%, -10%, etc.
    ) {
      // Exclude '+25% scoring.' and other explicit strings just to be safe
      if (r.sourceText !== '+25% scoring.') {
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

applyTranslations('input/languages/bmd_chunks/bmd_chunk_27.json', map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_28.json', map);
console.log('Translated BMD Chunk 27 and 28 successfully!');
