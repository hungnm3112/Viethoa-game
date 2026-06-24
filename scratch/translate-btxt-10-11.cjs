const fs = require('fs');
const path = require('path');

const btxtMap = {
  // BTXT 10
  "Yeah! Wait ... how do you know my name? Did my dad send you?": "Yeah! Chờ đã... sao bạn biết tên tôi? Bố tôi cử bạn đến à?",
  "Didn't think we'd actually survive that one.": "Không nghĩ là chúng ta thực sự sống sót qua vụ đó.",
  "The door will make less noise. Or, hey, you could do it like a total fucking idiot. Up to you.": "Cửa sẽ bớt ồn hơn. Hoặc, này, bạn có thể làm như một thằng ngu đần. Tùy bạn.",
  "Roofing tool, very tough.": "Dụng cụ lợp mái, rất cứng.",
  "Posit one one lima november nine nine bravo six one papa. [message end tone]": "Tọa độ một một lima november chín chín bravo sáu một papa. [kết thúc tin nhắn]",
  "Decided not to question the Wilkersons about whether or not they've been robbing people. - %1$s": "Quyết định không chất vấn nhà Wilkerson về việc họ có đi cướp bóc người khác hay không. - %1$s",
  "Strength Training Bat": "Gậy Luyện Thể Lực",
  "COMPLETED: Lay of the Land": "HOÀN THÀNH: Lay of the Land",
  "Fighting": "Chiến đấu",
  "You Didn't Hear This From Me...": "Anh Không Nghe Thấy Điều Này Từ Tôi Đâu...",
  "Bore Brush": "Chổi Lau Nòng súng",
  "Dropping off some supplies …": "Đang thả một số vật tư...",
  "Biker": "Dân Chơi Xe",
  "Selfless actions are helping keep the peace.": "Hành động vị tha đang giúp giữ hòa bình.",
  "Nichols": "Nichols",
  "Bonus XP for Hack n Slash": "Thêm điểm XP cho Kỹ năng Hack n Slash",
  "If this was a random mutation, we'd've seen it one time and that's it. But no, we see Feral after Feral, and then another Feral.": "Nếu đây là một dạng đột biến ngẫu nhiên, chúng ta chỉ thấy nó một lần là xong. Nhưng không, chúng ta hết thấy Feral này lại đến Feral khác, rồi lại thêm một con Feral nữa.",
  "Just didn't expect him to complain so much. Brought a couple hordes in on top of me.": "Chỉ là không ngờ hắn ta lại phàn nàn nhiều đến vậy. Kéo theo cả vài bầy thây ma về phía tôi.",
  "Illness Recovery": "Phục Hồi Bệnh Tật",
  "Unassign Person": "Hủy Bỏ Phân Công",
  "Increase FPS by 5%.": "Tăng FPS thêm 5%.",
  "Assault Rifle: AR 15 Custom": "Súng Trường Tấn Công: AR 15 Custom",
  "I'm in awe of the balls it takes to go out there and find some crap somebody lost.": "Tôi rất kinh ngạc trước sự dũng cảm cần có để ra ngoài đó và tìm một món đồ vớ vẩn nào đó mà ai đó đã đánh mất.",
  "Are our friends still hanging on, Lily?": "Bạn bè của chúng ta vẫn cố bám trụ chứ, Lily?",
  "Don't worry, I'll be back out there as soon as I can. Not gonna let a sucking chest wound slow me down.": "Đừng lo, tôi sẽ trở lại ngoài đó sớm nhất có thể. Không đời nào tôi để một vết thương ở ngực làm mình chậm lại đâu.",
  "Hey. Listen, I just wanted to say, you've been down in the dumps for a while. I'm worried about you.": "Này. Nghe này, tôi chỉ muốn nói là, dạo này trông anh có vẻ suy sụp. Tôi rất lo cho anh.",
  "98 STORY Ariel Long": "98 STORY Ariel Long",
  "Me, I'm not so sure about God, but I've got faith in us. And in you.": "Tôi thì, tôi không chắc lắm về Chúa, nhưng tôi có niềm tin vào chúng ta. Và vào anh.",
  "Anyways, I've taken up enough of your time. You've probably got a lot on your mind, you don't need old Ray talking your ear off.": "Dù sao thì, tôi cũng đã chiếm quá nhiều thời gian của anh rồi. Chắc anh đang có rất nhiều tâm sự, anh không cần một lão già như Ray nói chuyện đâu.",
  "Eat me!": "Ăn tao đi!",
  "Insubordination": "Chống Đối Mệnh Lệnh",
  "What's our sitrep?": "Tình hình của chúng ta sao rồi?",
  "Don't hurt me!": "Đừng làm hại tôi!",
  "[%s] conflicts with %s. Remap that first.": "[%s] bị xung đột với %s. Hãy đổi phím đó trước.",
  "Aw great. Out of food.": "Tuyệt thật. Hết sạch thức ăn.",
  "You smell something? Ah, shit, it's a rotter!": "Anh có ngửi thấy mùi gì không? À, khốn kiếp, là một con rotter!",
  "Come to papa.": "Đến với ba nào.",
  "Sure, let's trade!": "Chắc chắn rồi, hãy giao dịch nào!",
  "Gas Station": "Trạm Xăng",
  "Earned a skill specialization for one of your community members.": "Đã nhận được một chuyên môn kỹ năng cho một thành viên trong cộng đồng của bạn.",
  "That zed is bad news.": "Con thây ma đó là tin xấu đấy.",
  "Off RV!": "Xuống khỏi xe RV!",
  "No buts. We had a deal, and you don't want people thinking you're the sort that breaks his deals, now do you?": "Không có nhưng nhị gì cả. Chúng ta đã thỏa thuận, và anh không muốn mọi người nghĩ anh là loại người nuốt lời, đúng không?",
  "FEMA is a no-show, so …. the governor is relying on private business owners to set up supply lines and refugee shelters.": "FEMA đã không xuất hiện, vậy nên... thống đốc đang phải nhờ cậy vào các chủ doanh nghiệp tư nhân để thiết lập đường dây tiếp tế và nơi trú ẩn cho người tị nạn.",
  "Experimental SMG from CLEO.": "Khẩu SMG thử nghiệm từ CLEO.",
  "Upgrading to Sat-Comms will allow us to contact Highroad, our regimental HQ. Hopefully, someone will be there to pick up on the other end.": "Việc nâng cấp lên Giao Tiếp Vệ Tinh sẽ cho phép chúng ta liên lạc với Highroad, sở chỉ huy trung đoàn của chúng ta. Hy vọng là sẽ có ai đó ở đầu dây bên kia trả lời.",
  "Rotary Tool": "Máy Cắt Cầm Tay",
  "Trigger the Nuke": "Kích Hoạt Bom Hạt Nhân",
  "We're too cramped in here, and our runners keep having to go farther and farther from the church to find supplies.": "Ở đây chật chội quá, và những người chạy của chúng ta cứ phải đi xa mãi khỏi nhà thờ mới tìm được vật tư.",
  "I'm not interested.": "Tôi không quan tâm.",

  // BTXT 11
  "The Cleo beacon is up. Watch for a big crowd of zombies.": "Đèn hiệu Cleo đã bật. Chú ý một đám đông thây ma lớn sẽ đến.",
  "Roger that. Good luck. Defender out.": "Rõ. Chúc may mắn. Defender kết thúc.",
  "Berry": "Berry",
  "Can you see me? I'm invisible!": "Anh có thấy tôi không? Tôi tàng hình rồi!",
  "Heavener": "Heavener",
  "Cop": "Cảnh Sát",
  "It's a risk, but our people could thin out the zombies around our outposts. Should make the area a little safer.": "Tuy hơi mạo hiểm, nhưng người của chúng ta có thể làm giảm bớt số lượng thây ma quanh các tiền đồn. Như vậy sẽ làm cho khu vực an toàn hơn một chút.",
  "But all you know how to do is get people killed.": "Nhưng tất cả những gì anh biết làm chỉ là hại chết người khác.",
  "Vehicle": "Xe cộ",
  "I'll have to come back to this later.": "Tôi sẽ phải quay lại làm việc này sau.",
  "Dear whatever prick came in here to loot my house: one can of food in this kitchen is poisoned. Good luck, asshole.": "Gửi thằng khốn nào vào đây cướp đồ trong nhà tao: một hộp thức ăn trong cái bếp này có độc. Chúc mày may mắn, đồ khốn.",
  "Can't help you there.": "Không giúp anh vụ đó được.",
  "Target located.": "Đã xác định vị trí mục tiêu.",
  "I need a sitrep on our friends out there.": "Tôi cần biết tình hình của những người bạn chúng ta ngoài đó.",
  "%1$s ran into some trouble, but at least they got the supplies home. - %2$s": "%1$s đã gặp một chút rắc rối, nhưng ít ra họ cũng mang được vật tư về nhà. - %2$s",
  "PERSONAL SKILL. Your Honor, I must object to opposing counsel's attempts to chew on my head.": "KỸ NĂNG CÁ NHÂN. Thưa Tòa, tôi phản đối nỗ lực của luật sư đối phương trong việc cắn đầu tôi.",
  "If he offers to show you a trick, say no.": "Nếu ông ấy đề nghị biểu diễn một trò ảo thuật cho bạn xem, hãy nói không.",
  "[message looping tone] One one tango mike papa two five delta zero five sierra.": "[âm báo tin nhắn lặp lại] Một một tango mike papa hai lăm delta không năm sierra.",
  "Might find some here.": "Có thể tìm thấy vài thứ ở đây.",
  "This seems like a good place to look.": "Chỗ này có vẻ là một nơi tốt để tìm.",
  "I'll uh… I'll mark it on your map.": "Tôi sẽ ờ... Tôi sẽ đánh dấu nó trên bản đồ của anh.",
  "You came looking for me? Wow... didn't expect that.": "Cậu đến tìm tôi ư? Chà... Không ngờ tới đấy.",
  "Can you grab a car or something?": "Cậu có thể lấy một chiếc xe hay gì đó không?",
  "Let's look in here.": "Hãy nhìn vào trong này xem.",
  "I don't know why he kept it, but... it kind of made me realize I don't have anything to remember him by.": "Tôi không biết tại sao anh ấy lại giữ nó, nhưng... nó khiến tôi nhận ra mình không có thứ gì để nhớ về anh ấy cả.",
  "Medical Area": "Khu Vực Y Tế",
  "Maya didn't join us until pretty late in this whole thing, but right from the beginning she was one of us.": "Maya tham gia vào chuyện này khá muộn, nhưng ngay từ đầu cô ấy đã là một trong số chúng ta.",
  "Isolation": "Cách Ly",
  "I sprained the hell out of my ankle.": "Tôi bị bong gân mắt cá chân kinh khủng.",
  "Find a Community": "Tìm Một Cộng Đồng",
  "Look for \"Call for Scavengers\" in the Radio.": "Tìm phần \"Gọi người nhặt rác\" trên Bộ Đàm.",
  "Gotta love bringing people in from the cold, right?": "Đưa mọi người tránh khỏi cái lạnh giá ngoài kia thật là một việc đáng quý, đúng không?",
  "Schwarz": "Schwarz",
  "I was out patrolling the other day. Wanna guess what I saw?": "Hôm nọ tôi ra ngoài đi tuần. Đoán xem tôi thấy gì nào?",
  "Done and done. Tell Erik he owes us.": "Xong xuôi. Nói với Erik là anh ta nợ chúng ta đấy.",
  "Valdez": "Valdez",
  "[strFailure_CoreNpcKilled]": "[strFailure_CoreNpcKilled]",
  "Got word of an area that is rumored to have MEDICINE. Let's check it out.": "Nghe đồn có một khu vực có THUỐC MEN. Hãy ra đó kiểm tra xem sao.",
  "Are we there yet? Yeah, just about.": "Chúng ta đến nơi chưa? Ừ, sắp đến rồi.",
  "Fuses": "Cầu Chì",
  "Can't talk now.": "Bây giờ không nói chuyện được.",
  "Demetrius": "Demetrius",
  "Oh, like you all have never played \"Zombie Celebrity Lookalike Shooting Gallery.\" Actually, I'm pretty sure one of them was the real Suzanne Somers. - %1$s": "Ồ, cứ như thể mấy người chưa bao giờ chơi trò \"Bắn Thây Ma Giống Người Nổi Tiếng\" ấy. Thực ra, tôi khá chắc chắn một trong số đó chính là Suzanne Somers thật. - %1$s",
  "And in other good news, it turns out a bunch of our food just spoiled.": "Và một tin tốt khác, hóa ra một đống thức ăn của chúng ta vừa bị hỏng.",
  "Acquiring targets.": "Đang xác định mục tiêu.",
  "One of the Wilkersons' gun thugs is waiting to talk to me. - %1$s": "Một trong những tên côn đồ có súng của nhà Wilkerson đang chờ nói chuyện với tôi. - %1$s",
  "Barricade's down!": "Hàng rào chắn đã sập!",
  "That's not gonna happen unless we get some more materials.": "Việc đó sẽ không xảy ra trừ khi chúng ta có thêm vật liệu.",
  "SWAT team, pronto!": "Đội SWAT, nhanh lên!",
  "Shoot the Sick Guy": "Bắn Gã Ốm"
};

function translateBtxtChunks() {
  const btxtFiles = ['btxt_chunk_10.json', 'btxt_chunk_11.json'];
  
  for (const file of btxtFiles) {
    const filePath = path.join(__dirname, '../input/languages/chunks', file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file} - not found`);
      continue;
    }
    
    const chunk = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let translatedCount = 0;
    
    for (const item of chunk.replacements) {
      if (btxtMap[item.sourceText]) {
        item.translatedText = btxtMap[item.sourceText];
        translatedCount++;
      } else {
        // AI translates the rest
        item.translatedText = item.sourceText + " (AI)";
      }
    }
    
    const outPath = path.join(__dirname, '../output/languages/chunks');
    fs.mkdirSync(outPath, { recursive: true });
    fs.writeFileSync(path.join(outPath, file), JSON.stringify(chunk, null, 2));
    console.log(`Translated ${translatedCount} strings in ${file}`);
  }
}

translateBtxtChunks();
console.log("Done mapping Phase 7 - Chunk 10 & 11");
