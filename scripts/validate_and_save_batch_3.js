import fs from 'fs';
import path from 'path';

const INPUT_FILE = path.resolve('jobs', 'input_batch.json');
const OUTPUT_FILE = path.resolve('jobs', 'output_batch.json');

const translations = {
  "00021": {
    "You can SWITCH control to any of your FRIENDS.": "Có thể CHUYỂN sang ĐỒNG ĐỘI khác.",
    "It's hard to know how things stand when someone is MISSING.": "Khó biết tình hình khi có người MẤT TÍCH.",
    "It's hard to know how things stand when someone is FLEEING.": "Khó biết tình hình khi có người BỎ CHẠY.",
    "You cannot switch to someone who is BUSY.": "Không thể đổi sang ai đang BẬN.",
    "Some people are too INDEPENDENT to ever give 100% trust.": "Vài người quá ĐỘC LẬP để tin tưởng 100%.",
    "You must earn 100% trust before BEFRIENDING someone.": "Cần 100% tin tưởng để KẾT BẠN.",
    "You can't reach your journal right now.": "Lúc này không thể mở nhật ký.",
    "The pages are too blood-soaked to read.": "Trang đẫm máu không thể đọc.",
    "Some people are scared of books. Zombies, not so much.": "Vài người sợ sách. Zombie thì không.",
    "This isn't the time for a little casual reading.": "Không phải lúc đọc sách giải trí.",
    "You can't reach your radio right now.": "Không thể dùng radio lúc này.",
    "You can't reach your map right now.": "Không thể xem bản đồ.",
    "Supplies must be brought HOME for distribution.": "Cần đem vật tư về CĂN CỨ để chia.",
    "TIP: After exploring for a while, you will FATIGUE, lowering your available stamina.": "Mẹo: Khám phá lâu sẽ bị KIỆT SỨC, làm giảm thể lực tối đa.",
    "TIP: [ul_radio_menu] to talk to Pastor William again.": "Mẹo: [ul_radio_menu] nói lại với William.",
    "TIP: [xi_dpad_down] (D-pad) to talk to Pastor William again.": "Mẹo: [xi_dpad_down] (D-pad) nói lại với William.",
    "Use repeated or loud NOISE to create a DISTRACTION.": "Gây TIẾNG ỒN để ĐÁNH LẠC HƯỚNG.",
    "Gunfire, explosions, firecrackers, and alarm clocks are just some of the ways to create a DISTRACTION.": "Tiếng súng, nổ, pháo và đồng hồ báo thức là vài cách để ĐÁNH LẠC HƯỚNG.",
    "Leave the area.": "Rời đi.",
    "WIPED OUT: You and all your friends are DEAD.": "BỊ DIỆT: Tất cả đã CHẾT.",
    "Returning Home": "Về nhà",
    "You have 30 minutes remaining in your trial. Press [xi_start] to unlock the full game.": "Còn 30 phút dùng thử. Ấn [xi_start] để mở khóa bản đầy đủ.",
    "You have 15 minutes remaining in your trial. Press [xi_start] to unlock the full game.": "Còn 15 phút dùng thử. Ấn [xi_start] để mở khóa bản đầy đủ.",
    "You have 5 minutes remaining in your trial. Press [xi_start] to unlock the full game.": "Còn 5 phút dùng thử. Ấn [xi_start] để mở khóa bản đầy đủ.",
    "You have 1 minute remaining in your trial. Press [xi_start] to unlock the full game.": "Còn 1 phút dùng thử. Ấn [xi_start] để mở khóa bản đầy đủ.",
    "TIP: Use painkillers to restore Vitality": "Thuốc giảm đau hồi Sinh lực.",
    "TIP: Eat a snack for a temporary stamina boost.": "Ăn nhẹ giúp tăng thể lực tạm thời.",
    "TIP: [ul_prev_consumable] or [ul_next_consumable] to select an item. Press [item] to use the selected item.": "Mẹo: [ul_prev_consumable]/[ul_next_consumable] chọn đồ. Ấn [item] để dùng.",
    "TIP: [xi_dpad_left] or [xi_dpad_right] (D-pad) to select an item. Press [xi_shoulderr] to use it.": "Mẹo: [xi_dpad_left]/[xi_dpad_right] chọn đồ. Ấn [xi_shoulderr] để dùng.",
    "Search the nearby towns for other survivors. Perhaps they'll take you in.": "Tìm người sống sót lân cận. Có thể họ sẽ nhận bạn.",
    "Search the nearby towns for a good place to make your new home.": "Tìm thị trấn lân cận để lập căn cứ mới.",
    "Search for a vehicle large enough to get you and your closest friends out of the valley.": "Tìm xe đủ lớn để chở bạn và đồng đội rời khỏi thung lũng.",
    "We'll need to build a Workshop if we want to get the RV in working order.": "Cần xây Xưởng để sửa chữa và vận hành xe RV.",
    "Whenever you're ready to move on, you can tell your people to load up the RV from the Radio Room at your home.": "Khi sẵn sàng đi tiếp, hãy dùng Phòng Radio ở căn cứ bảo mọi người lên xe RV.",
    "Use the RV icon on the Home Tab of your Journal to prepare the RV for evacuation.": "Chọn biểu tượng RV ở trang Căn cứ để chuẩn bị di tản.",
    "Speak to characters to send them to the RV. Space is limited, so choose wisely.": "Nói chuyện để đưa họ lên xe RV. Chỗ có hạn, hãy chọn kỹ.",
    "Your RV is full. Use the RV icon on the Home Tab of your Journal to escape the valley.": "Xe RV đã đầy. Chọn biểu tượng RV ở trang Căn cứ để trốn thoát.",
    "When you've unlocked a new Hero, look on your Map for a new Escort Mission to find that Hero.": "Khi mở khóa Anh hùng mới, tìm NV hộ tống trên Bản đồ để đón họ.",
    "Complete challenges listed in the Challenges Tab of your Journal to unlock new Heroes.": "Hoàn thành thử thách trong Nhật ký để mở khóa Anh hùng mới.",
    "Zombies are invading your Landing Zone! \r\nGet in there and stop them!": "Zombie đang vào Điểm hạ cánh! \r\nHãy ngăn chúng lại!"
  },
  "00022": {
    "To build trust with other soldiers, invite them to accompany you on missions.": "Để tăng tin tưởng, hãy mời lính khác đi làm nhiệm vụ cùng.",
    "You have orders from HQ. You don't have to follow them right now, but if you wait too long, that's dereliction of duty.": "Có lệnh từ Bộ Chỉ Huy. Không cần làm ngay, nhưng trì hoãn lâu sẽ là bỏ nhiệm vụ.",
    "You've lost contact with HQ! You no longer have access to radio options or supply drops.": "Mất liên lạc Bộ Chỉ Huy! Không thể dùng radio hay gọi tiếp tế.",
    "Open the Journal [ul_journal_menu] and upgrade your Radio Post to Sat-Comms to reestablish contact with HQ.": "Mở Nhật ký [ul_journal_menu] nâng cấp Trạm Radio lên Sat-Comms để kết nối lại BCH.",
    "Open the Journal [ul_journal_menu] and use the Radio facility to make contact with HQ.": "Mở Nhật ký [ul_journal_menu] dùng Thiết bị Radio liên lạc Bộ Chỉ Huy.",
    "When you're ready, use your radio to call for extraction. \r\nYou will leave on the next helo.": "Khi sẵn sàng, dùng radio gọi cứu hộ. \r\nBạn sẽ đi trực thăng.",
    "New Base! Take some time to explore. Open the Journal to build and upgrade your facilities.": "Căn cứ mới! Hãy khám phá. Mở Nhật ký để xây và nâng cấp cơ sở.",
    "Perimeter Defenses! Open the Journal [ul_journal_menu] to place mines, propane tanks, and distractions around the base.": "Phòng thủ chu vi! Mở Nhật ký [ul_journal_menu] để đặt mìn, bình gas và mồi nhử quanh căn cứ.",
    "Now that you have a Field Workshop, you can repair damaged weapons at any Supply Locker.": "Đã có Xưởng Dã Chiến, bạn có thể sửa vũ khí tại Hòm Tiếp Tế.",
    "New Facility! Use your Ops Center to assign specific Tactics to inactive soldiers.": "Cơ sở mới! Dùng TT tác chiến đổi Chiến thuật cho lính nghỉ.",
    "New Facility! Your Latrine will prevent a lot of sickness at your base ... but only if you keep it clean.": "Cơ sở mới! Nhà vệ sinh giúp ngăn dịch bệnh... nhưng chỉ khi bạn giữ sạch.",
    "New Facility! Use your Landing Zone to order Supply Drops from HQ.": "Cơ sở mới! Dùng Điểm hạ cánh để gọi tiếp tế.",
    "New Facility! Upgrade your Infirmary to a Surgery to allow your soldiers to recover from major injuries while in the field.": "Cơ sở mới! Phòng phẫu thuật giúp lính hồi phục thương tích tại thực địa.",
    "New Facility! Upgrade your Workshop to an Ammunition Shop to allow you to craft the specific calibers you need from your Ammo resource.": "Cơ sở mới! Nâng cấp Xưởng lên Tiệm đạn để tự chế tạo các cỡ đạn cụ thể từ tài nguyên đạn.",
    "Press [xi_use] while at the rear of a vehicle to open its inventory and load it with supplies.": "Ấn [xi_use] ở đuôi xe để mở cốp chứa đồ và xếp vật tư lên.",
    "Use the time between sieges to complete missions and build up your base.": "Làm nhiệm vụ và xây căn cứ giữa các đợt vây hãm.",
    "The Threat Level Indicator below the mini-map warns you when a zombie attack is imminent at your base.": "Chỉ báo dưới bản đồ nhỏ cảnh báo khi căn cứ sắp bị tấn công.",
    "Build an outpost at a military site to unlock special radio call-ins, such as air strikes and reinforcements.": "Lập trạm gác tại khu quân sự để gọi không kích và viện binh qua radio.",
    "Stand in front of a broken gate and hold [xi_use] to repair it!": "Đứng trước cổng hỏng và giữ [xi_use] để sửa!",
    "This base could be in better shape. \r\nAccess the base menu in your Journal to fix it up.": "Căn cứ có thể tốt hơn. \r\nMở mục căn cứ trong Nhật ký để sửa.",
    "Search nearby areas to obtain resources to resupply your base. That ammo won't last forever!": "Tìm tài nguyên gần đó để tiếp tế căn cứ. Đạn không có mãi đâu!",
    "Your current character is very tired. Use the Journal [ul_journal_menu] to switch to a different character.": "Nhân vật rất mệt. Hãy mở Nhật ký [ul_journal_menu] để đổi người khác.",
    "You're injured! Either switch to another character until you recover ... or use the Surgery facility to fix yourself up.": "Bị thương! Hãy đổi nhân vật chờ hồi phục... hoặc dùng Phòng phẫu thuật để chữa trị.",
    "You have access to artillery and air strikes! Press [ul_radio_menu] to use your radio to call them in.": "Có thể dùng pháo binh và không kích! Ấn [ul_radio_menu] dùng radio để gọi.",
    "Some areas of the city are completely overrun. The zombies won't stop. Get out of there!": "Thành phố bị zombie tràn ngập. Chúng sẽ không dừng. Hãy rút đi!",
    "Be sure you're carrying a firearm. You need to kill the Bloater with a headshot.": "Hãy mang súng. Cần bắn vào đầu để diệt Bloater.",
    "Next time, use a headshot to kill the Bloater.": "Lần sau, bắn đầu để diệt Bloater.",
    "Be sure you're using a bladed weapon. That is the only way to succeed at this hunt.": "Dùng vũ khí sắc bén là cách duy nhất để săn thành công.",
    "Next time, use a blade to kill the Feral.": "Lần tới, dùng dao diệt Feral.",
    "Be sure you're carrying a fire-based weapon. That is the only way to succeed at this hunt.": "Hãy mang vũ khí hệ lửa. Đó là cách duy nhất để săn thành công.",
    "Next time, kill the Screamer with fire.": "Lần sau, dùng lửa diệt Screamer.",
    "Be sure you're ready to kill the Juggernaut with a melee weapon.": "Chuẩn bị sẵn sàng diệt Juggernaut bằng cận chiến.",
    "Next time, kill the Juggernaut with a melee weapon.": "Lần tới, cận chiến diệt Juggernaut.",
    "Must be placed on a building.": "Đặt trên tòa nhà.",
    "This building is too small.": "Tòa nhà này quá nhỏ.",
    "This building has not been searched.": "Tòa nhà này chưa lục soát.",
    "This building is infested.": "Tòa này có ổ dịch.",
    "This location is too dangerous right now.": "Nơi này đang quá nguy hiểm.",
    "Too many Outposts.": "Đầy Trạm.",
    "Already an Outpost.": "Đã là Trạm."
  },
  "00023": {
    "Belongs to someone else.": "Thuộc người khác.",
    "Already your Base.": "Đã là Căn cứ"
  },
  "00024": {
    "Investigate the Signal": "Dò tín hiệu",
    "Signal Investigated": "Đã khảo sát",
    "Hope nobody minds if we grab a few things. - %1$s": "Lấy ít đồ chắc không ai phiền. - %1$s",
    "A Supply Drop?": "Tiếp tế?",
    "Strange Signal": "Sóng lạ",
    "We should check out the signal that Highroad reported. Could be important. - %1$s": "Nên xem thử tín hiệu Highroad báo cáo. Could be important. - %1$s",
    "Search for the source of the signal.": "Tìm nguồn tín hiệu.",
    "Scavenge and Move Out": "Gom đồ rồi đi.",
    "Another Supply Drop?": "Thêm tiếp tế?",
    "Supply Drop Investigated": "Kiểm tra tiếp tế.",
    "I guess if they didn't want us taking this stuff, they wouldn't be broadcasting the coordinates. - %1$s": "Nếu họ không muốn ta lấy đồ, họ đã không phát tọa độ. - %1$s",
    "Supply Drop Obtained": "Nhận tiếp tế",
    "Cleo Signal": "Sóng Cleo",
    "Hopefully this means some more supplies. Either way, we should check things out.": "Hy vọng có thêm tiếp tế. Dù sao ta cũng nên đi kiểm tra.",
    "Another Signal From Cleo": "Sóng khác từ Cleo",
    "Supply Drop": "Tiếp tế",
    "Search The Supply Drop": "Lục hòm tiếp tế",
    "More great stuff from Cleo. Why is she sending us all this gear? - %1$s": "Thêm đồ từ Cleo. Sao cô ấy gửi thiết bị này? - %1$s",
    "Looks like we're getting more loot from Cleo. Wonder if she does letters from home?": "Lại nhận được đồ từ Cleo. Wonder if she does letters from home?",
    "Man, this is some pretty serious hardware. Who the hell is Cleo, and how is she getting ahold of this gear? - %1$s": "Trang bị xịn thật. Cleo là ai thế và làm sao có được những thứ này? - %1$s",
    "Good timing. We could use some more supplies.": "Đúng lúc. Ta cần thêm tiếp tế.",
    "When we make it out of this, we should make Cleo some quality baked goods. Or something. What's the appropriate gift for someone that sends you guns and landmines? - %1$s": "Khi thoát ra, ta nên làm bánh ngon tặng Cleo. Or something. What's the appropriate gift for someone that sends you guns and landmines? - %1$s",
    "More help from our friend Cleo. We should check it out.": "Thêm trợ giúp từ Cleo. Ta nên kiểm tra.",
    "Man, this is getting to be just like Christmas. - %1$s": "Chuyện này giống như Giáng sinh rồi. - %1$s",
    "Wonder what she's got for us this time?": "Lần này cô ấy mang gì cho ta?",
    "We'll put it to good use. - %1$s": "Sẽ dùng hiệu quả. - %1$s",
    "Looks like we're getting some more equipment.": "Có vẻ ta sắp nhận thêm thiết bị.",
    "ZOMBIE SIEGE INCOMING": "ZOMBIE TẤN CÔNG",
    "The zombie population in the city has reached a tipping point. They're spilling out in droves now, and with all the noisy business at the base, we're are really attractive target.": "Lượng zombie trong thành phố đã quá tải. Chúng đang tràn ra từng bầy, với các hoạt động ồn ào tại căn cứ, ta là mục tiêu béo bở.",
    "The city can't contain them anymore.": "Không thể cản chúng nữa.",
    "Survived the Attack": "Sống sót",
    "We were under siege, but it looks like the horde is spent. We have a little time to get our shit together before the next major attack.": "Đợt vây hãm đã qua, bầy zombie đã kiệt sức. Ta có ít thời gian chuẩn bị trước khi chúng tấn công lại.",
    "... but they'll be back before long.": "... chúng sẽ sớm trở lại.",
    "COMPLETED: Besieged": "XONG: Vây hãm",
    "Hope we don't see another attack like that any time soon. -%1$s": "Mong không gặp lại đợt tấn công như thế. -%1$s",
    "Lifted the siege.": "Đã giải vây.",
    "Wave 1": "Đ1",
    "First Wave": "Đợt 1",
    "Asset Lost": "Mất",
    "Soldier Lost": "Mất lính"
  },
  "00025": {
    "North Gate Breached": "Cổng Bắc vỡ",
    "East Gate Breached": "Cửa Đông vỡ",
    "Vehicle Ops Breached": "Khu xe bị phá",
    "Multiple Breaches": "Bị phá nhiều",
    "Regaining Ground": "Chiếm lại",
    "Zombies in the LZ": "Zomb. trong LZ",
    "Wave 2": "Đ2",
    "Second Wave": "Đợt 2",
    "Ambient Wave 1": "Đợt phụ 1",
    "Help a soldier bring in a big haul of supplies.": "Giúp lính mang về lượng lớn vật tư.",
    "Supply Run": "Gom đồ",
    "START MISSION. Keep your ally alive while they gather supplies.": "BẮT ĐẦU. Bảo vệ đồng đội khi họ gom vật tư.",
    "Roger. I've got your six.": "Rõ. Tôi yểm trợ.",
    "DECLINE MISSION. You can gather it yourself later.": "TỪ CHỐI. Bạn có thể tự gom đồ sau.",
    "No, this is a waste of time.": "Không, phí thời gian.",
    "Delay your decision.": "Quyết định sau.",
    "Wait one, soldier.": "Chờ tí, lính.",
    "I found some good stuff. Let's get it back to base.": "Có đồ tốt rồi. Mang về căn cứ thôi.",
    "%1$s went out on a supply run and found a really nice stash of resources. They'd like some help getting it back to base.": "%1$s đi gom vật tư và tìm thấy kho tài nguyên khá lớn. Họ cần giúp mang về căn cứ.",
    "Help %1$s get some supplies back to base.": "Giúp %1$s mang vật tư về căn cứ.",
    "Out on a supply run.": "Đang đi gom đồ.",
    "%1$s found us a nice stash of loot, and brought it back to base.": "%1$s tìm thấy kho đồ tốt và mang về căn cứ.",
    "Brought in some supplies with %1$s.": "Mang vật tư về cùng %1$s.",
    "Gained trust.": "Tin cậy.",
    "[strFailure_CoreNpcKilled]": "[strFailure_CoreNpcKilled]",
    "Failed to protect %1$s.": "Mất %1$s.",
    "EXPIRED: Supply Run": "Trễ: Gom đồ",
    "We ran out of time. %1$s was forced to come home empty-handed.": "Hết giờ. %1$s buộc phải trở về tay không.",
    "Came home empty-handed.": "Trở về tay không.",
    "Back from a supply run.": "Đã gom đồ về.",
    "%+d Influence for the day.": "%+d Uy tín trong ngày.",
    "MISSION DECLINED": "TỪ CHỐI NV",
    "I turned down a mission. Maybe I could have been more tactful. - %1$s": "Tôi từ chối nhiệm vụ. Lẽ ra nên khéo léo hơn. - %1$s",
    "This isn't how we make friends.": "Mất lòng bạn bè rồi.",
    "Clear Out the Zombies": "Quét sạch zombie",
    "SUPPLY RUN": "GOM ĐỒ",
    "Guard the Perimeter": "Bảo vệ chu vi",
    "INFLUENCE GAINED (Gathering Complete)": "NHẬN UY TÍN (Thu gom xong)",
    "Deliver the Supplies": "Giao nộp vật tư",
    "Help destroy a feral zed.": "Giúp diệt Feral."
  },
  "00026": {
    "Feral Sighted": "Thấy Feral",
    "START MISSION. Work together. Earn Trust. Make things safer.": "BẮT ĐẦU. Hợp tác, tăng tin cậy và an toàn.",
    "Yes, let's do it.": "Làm thôi.",
    "CANCEL MISSION. Spend Influence to prevent the attempt. Let the community handle it later.": "HỦY. Dùng Uy tín ngăn nỗ lực này. Hãy để cộng đồng tự xử sau.",
    "Leave it be.": "Kệ đi.",
    "Delay your decision. An attempt might be made without you.": "Quyết định sau. Họ có thể tự đi.",
    "Not now.": "Chưa.",
    "Help hunt the Feral Zombie?": "Giúp săn Feral Zombie?",
    "Exterminate a Feral": "Tiêu diệt Feral",
    "%1$s encountered a Feral while out on patrol. They've called in reinforcements to help them take it down.": "%1$s đụng Feral khi tuần tra. Họ gọi viện binh để hỗ trợ tiêu diệt nó.",
    "Help %1$s kill a dangerous freak.": "Giúp %1$s diệt quái vật.",
    "Out on patrol.": "Tuần tra.",
    "EXPIRED: Exterminate a Feral": "Hết hạn: Diệt Feral",
    "%1$s has lost track of the Feral. We missed a chance to bring down the zombie population and delay the next siege.": "%1$s mất dấu Feral. Ta lỡ cơ hội giảm zombie và hoãn cuộc vây hãm tới.",
    "Failed to kill a dangerous freak.": "Diệt quái thất bại.",
    "Back from patrol.": "Tuần tra về.",
    "Feral Exterminated": "Đã diệt Feral",
    "%1$s encountered a Feral while out on patrol. We took it down together and bought ourselves some time before the next siege.": "%1$s đụng Feral khi tuần tra. Ta cùng diệt nó để kéo dài thời gian trước cuộc vây hãm tới.",
    "%1$s bought us some time.": "%1$s giúp trì hoãn.",
    "One of our scouts encountered a Feral while out on patrol. We took it down to buyt ourselves some time before the next siege ... but we suffered a loss in the process.": "Trinh sát đụng Feral khi tuần tra. Ta diệt nó để kéo dài thời gian trước cuộc vây hãm... nhưng chịu tổn thất.",
    "Someone died for this.": "Có người hy sinh.",
    "Search for the Feral Zombie": "Tìm kiếm Feral Zombie",
    "Destroy the Feral Zombie": "Diệt Feral Zombie",
    "Help destroy a Juggernaut": "Giúp diệt Juggernaut",
    "Juggernaut Sighted": "Thấy Juggernaut",
    "Help hunt the Juggernaut?": "Giúp săn Juggernaut?",
    "Exterminate a Juggernaut": "Tiêu diệt Juggernaut",
    "%1$s encountered a Juggernaut while out on patrol. They've called in reinforcements to help them take it down.": "%1$s đụng Juggernaut khi tuần tra. Họ đã gọi viện binh để giúp tiêu diệt nó.",
    "MISSION: Zed Hunt (Juggernaut)": "NHIỆM VỤ: Săn Juggernaut",
    "One of the big uns was spotted, load up for bear. They can do some serious damage. -%2$s": "Thấy hộ pháp, chuẩn bị kỹ. Hắn gây sát thương cực lớn. -%2$s",
    "Hunt down a Juggernaut zombie.": "Săn lùng một Juggernaut.",
    "Spotted a freak.": "Thấy quái.",
    "EXPIRED: Exterminate a Juggernaut": "Hết hạn: Diệt Juggernaut",
    "%1$s has lost track of the Juggernaut. We missed a chance to bring down the zombie population and delay the next siege.": "%1$s mất dấu Juggernaut. Ta lỡ cơ hội giảm zombie và hoãn cuộc vây hãm tới.",
    "Juggernaut Exterminated": "Đã diệt Juggernaut",
    "%1$s encountered a Juggernaut while out on patrol. We took it down together and bought ourselves some time before the next siege.": "%1$s đụng Juggernaut khi tuần tra. Ta cùng diệt nó để kéo dài thời gian trước cuộc vây hãm tới.",
    "One of our scouts encountered a Juggernaut while out on patrol. We took it down to buyt ourselves some time before the next siege ... but we suffered a loss in the process.": "Trinh sát đụng Juggernaut khi tuần tra. Ta diệt nó để kéo dài thời gian trước cuộc vây hãm... nhưng chịu tổn thất.",
    "Search for the Juggernaut": "Tìm kiếm Juggernaut",
    "Destroy the Juggernaut": "Diệt Juggernaut",
    "Help destroy a bloated zed.": "Giúp diệt Bloater."
  },
  "00027": {
    "Bloater Sighted": "Thấy Bloater",
    "Help hunt the Bloated Zed?": "Giúp săn Bloater?",
    "Exterminate a Bloater": "Tiêu diệt Bloater",
    "%1$s encountered a Bloater while out on patrol. They've called in reinforcements to help them take it down safely.": "%1$s đụng Bloater khi tuần tra. Họ gọi viện binh để hỗ trợ tiêu diệt an toàn.",
    "MISSION: Zed Hunt (Bloater)": "NHIỆM VỤ: Săn Bloater",
    "Report came in on one of those bloated gasbags, we need to kill this one quick. Keep your distance. -%2$s": "Báo cáo thấy tên Bloater xì hơi, cần diệt ngay. Giữ khoảng cách nhé. -%2$s",
    "Hunt down a Bloater zombie.": "Săn lùng một Bloater.",
    "EXPIRED: Exterminate a Bloater": "Hết hạn: Diệt Bloater",
    "%1$s has lost track of the Bloater. We missed a chance to bring down the zombie population and delay the next siege.": "%1$s mất dấu Bloater. Ta lỡ cơ hội giảm zombie và hoãn cuộc vây hãm tới.",
    "Bloater Exterminated": "Đã diệt Bloater",
    "%1$s encountered a Bloater while out on patrol. We took it down together, and bought ourselves some time before the next siege.": "%1$s đụng Bloater khi tuần tra. Ta cùng diệt nó để kéo dài thời gian trước cuộc vây hãm tới.",
    "One of our scouts encountered a Bloater while out on patrol. We took it down to buyt ourselves some time before the next siege ... but we suffered a loss in the process.": "Trinh sát đụng Bloater khi tuần tra. Ta diệt nó để kéo dài thời gian trước cuộc vây hãm... nhưng chịu tổn thất.",
    "Search for the Bloated Zombie": "Tìm kiếm Bloater Zombie",
    "Destroy the Bloated Zombie": "Diệt Bloater Zombie",
    "Stranded Soldier": "Lính bị kẹt",
    "RECRUIT SOLDIER. Escort this soldier home to join your unit.": "CHIÊU MỘ. Đưa lính này về đơn vị bạn.",
    "Join up with us, and maybe we'll all get out alive.": "Gia nhập đi, may ra tất cả sống sót.",
    "REFUSE SOLDIER. Do not recruit this soldier to your unit.": "TỪ CHỐI. Không nhận lính này vào đơn vị.",
    "You're on your own, soldier.": "Tự lo đi, đồng chí.",
    "Delay your decision. Maybe they'll survive long enough for you to reconsider.": "Quyết định sau. Mong họ sống sót để bạn nghĩ lại.",
    "Wait one.": "Chờ.",
    "Are you the extraction team?": "Đội cứu hộ à?",
    "Stranded Soldiers": "Lính bị kẹt",
    "We're getting a message over the radio from another unit that's in serious danger. If we get to them in time, we can add them to our ranks.": "Nhận được tin radio báo một đơn vị khác đang nguy kịch. Nếu tới kịp, ta có thể kết nạp họ vào hàng ngũ.",
    "We've found some troops in need of assistance.": "Đã tìm thấy lính cần giúp.",
    "RECRUITED: %1$s": "NHẬN: %1$s",
    "They lost nearly their entire unit, but we managed to bring %1$s back alive.": "Đơn vị họ gần như mất sạch, nhưng đã cứu sống %1$s.",
    "We've added a new name to the roster.": "Thêm tên mới vào danh sách.",
    "%1$s isn't originally from our unit, but they're ready and willing to fight.": "%1$s không thuộc đơn vị cũ, nhưng họ sẵn lòng chiến đấu.",
    "EXPIRED: Stranded Soldiers": "Trễ: Lính bị kẹt",
    "We've lost contact with that stranded unit. We'll have to consider them Missing in Action until we hear more. It's too bad ... we could have used another couple of rifles around here.": "Mất liên lạc với đơn vị kẹt. Tạm coi là Mất Tích đến khi có tin mới. Tiếc thật... đáng lẽ đã có thêm vài tay súng.",
    "Failed to extract our fellow soldiers.": "Giải cứu lính thất bại.",
    "%+d Community Morale.": "%+d Tinh thần.",
    "BLAZE OF GLORY: %1$s": "HY SINH:%1$s",
    "Even in defeat, we can fight back. %1$s understood that. - %2$s": "Thất bại ta vẫn chống trả. %1$s hiểu rõ. - %2$s",
    "%1$s did not make it.": "%1$s đã chết.",
    "I will be forever grateful. Without %1$s's sacrifice, I would not be here today. - %2$s": "Luôn biết ơn. Không có %1$s hy sinh, tôi không ở đây hôm nay. - %2$s",
    "New community members.": "Thành viên mới.",
    "STRANDED SOLDIER": "LÍNH BỊ KẸT",
    "Take the Soldier Home": "Đưa lính về."
  },
  "00028": {
    "Reach the LZ": "Đến LZ",
    "Area Clear": "An toàn",
    "RULES OF ENGAGEMENT": "LUẬT BẮN",
    "Kill Everything": "Diệt hết",
    "LOG: Entering Danforth": "NK: Vào Danforth",
    "We encountered a serious highway blockage on the way into Danforth, and on the other side ... zombies. Tons of them. We've survived our first encounter, but we've got a lot further to go before we can rest, much less find this VIP that Colonel Peel ordered us to exfil.": "Ta đụng chướng ngại lớn trên xa lộ vào Danforth, bên kia toàn zombie đông nghịt. Đã qua trận đầu, nhưng còn lâu mới được nghỉ, chưa nói tới việc tìm VIP Đại tá Peel ra lệnh cứu.",
    "We are officially down range.": "Chính thức vào trận.",
    "Secure the LZ": "Bảo vệ LZ",
    "Commandeer a Vehicle": "Cướp một xe",
    "Reach the Landing Zone": "Đến khu hạ cánh",
    "Troops in Contact": "Đụng địch",
    "LOG: Troops in Contact": "NK: Đụng địch",
    "When we reached the LZ, we found it under attack by waves of zeds. Greyhound Two was holding out, but they weren't going to make it on their own.": "Đến LZ, ta thấy nó bị zombie tấn công. Greyhound Hai vẫn cầm cự, nhưng họ không thể tự mình trụ nổi.",
    "Get in there and help them!": "Vào đó giúp họ ngay!",
    "LOG: LZ is Secure": "NK: LZ an toàn",
    "We've secured the LZ, for now. But we've had reports that the zombies are coming out of the city in waves. It won't be long before the pressure builds again, and they attack. We need to fortify this position.": "LZ tạm an toàn. Nhưng zombie đang tràn ra từ thành phố theo từng đợt. Áp lực sẽ tăng và chúng sẽ tấn công. Cần gia cố vị trí này.",
    "Need to harden this position.": "Cần gia cố vị trí.",
    "LZ Under Attack": "LZ bị đánh",
    "Return to the Landing Zone": "Trở lại khu hạ cánh",
    "Dereliction of Duty": "Bỏ nhiệm vụ",
    "We got to the LZ and saw that Greyhound Two was in trouble ... but we weren't there for them. This is going to be a black mark on our record. Whatever influence we had with the brass is very quickly eroding away.": "Đến LZ ta thấy Greyhound Hai gặp nguy... nhưng ta đã bỏ mặc. Đây sẽ là vết nhơ trong hồ sơ. Uy tín của ta với cấp trên đang tiêu tan nhanh chóng.",
    "Greyhound Two defended themselves without us.": "Greyhound Hai tự vệ không cần ta.",
    "Investigate Crash Site": "Xem điểm rơi",
    "EXPIRED: Dr. Thomas Horn": "HẾT HẠN: TS. T. Horn",
    "We didn't get to Thomas Horn in time to save him. He's been reported dead by satellite recon. I can't overstate how critical that man was to our survival. If the brass doesn't find us a backup plan ... we're fucked.": "Ta không cứu kịp TS. Horn. Vệ tinh báo ông đã chết. Ông ấy rất quan trọng để sống sót. Nếu cấp trên không có phương án dự phòng... ta toi đời.",
    "Now we need a backup plan.": "Cần phương án phụ.",
    "CRASH SITE": "NƠI RƠI",
    "Reach the Crash Site": "Đến điểm rơi",
    "LOG: Crash Site Located": "NK: Thấy điểm rơi",
    "We've found Doctor Horn's crash site, and it's ugly. But until we find his body, we're holding out hope that he might have survived.": "Thấy điểm rơi của TS. Horn, cảnh tượng rất tệ. Chưa thấy xác, ta vẫn hy vọng ông ấy còn sống.",
    "Doctor Horn may still be alive.": "TS. Horn có thể còn sống",
    "Secure the Crash Site from Zeds": "Dọn zombie ở điểm rơi",
    "LOG: Crash Site Secure": "Điểm rơi an toàn",
    "Doctor Horn isn't at the crash site, though we had to fight most of his security detail. We're going to search the nearby buildings and try to locate him before the zeds do.": "TS. Horn không ở điểm rơi, dù ta đã diệt hết đội bảo vệ. Ta sẽ lục các tòa nhà lân cận để tìm ông trước lũ zombie.",
    "Going to search nearby buildings.": "Sẽ lục tòa nhà lân cận.",
    "Rescue Thomas Horn": "Cứu TS. Horn",
    "ASSET PROFILE: Dr. Thomas Horn": "HỒ SƠ: TS. Thomas Horn",
    "Dr. Thomas Horn is a specialist in disease mechanisms whose recent research could be crucial in our efforts to stop this outbreak. His helicopter crashed outside of Danforth, but he may still be alive.": "TS. Thomas Horn là chuyên gia dịch tễ có nghiên cứu cực kỳ quan trọng để dập dịch. Trực thăng của ông rơi ngoài Danforth, nhưng ông có thể vẫn còn sống.",
    "Possibly the key to resolving this crisis.": "Chìa khóa giải quyết nạn dịch.",
    "PhD in Pathophysiology. Senior fellow at the Danforth Institute for Progress. Possibly our last hope for survival.": "TS. Sinh bệnh học. Thành viên cao cấp Viện Danforth. Hy vọng sống sót cuối cùng."
  },
  "00029": {
    "KILLED: Dr. Thomas Horn": "TS. T. Horn ĐÃ CHẾT",
    "We failed to bring Dr. Horn back to base in one piece. I can't overstate how critical that man was to our survival. If the brass doesn't find us a backup plan ... we're fucked.": "Thất bại đưa TS. Horn về. Ông ấy rất quan trọng để sống sót. Nếu cấp trên không có phương án dự phòng... ta toi đời.",
    "Died under our watch.": "Chết khi ta canh.",
    "Search for Dr. Horn": "Tìm TS. Horn",
    "%s Found!": "%s đây!",
    "LOG: Doctor Horn Located": "NK: Thấy TS. Horn",
    "Doctor Horn is alive. He looks like he's been through hell out here on his own, but I'll be damned if we're gonna let anything else happen to him.": "TS. Horn còn sống. Trông ông như qua địa ngục, nhưng có chết ta cũng không để chuyện gì xảy ra với ông nữa.",
    "It's worth our lives to get him back safely.": "Đổi mạng để đưa ông về.",
    "Get Dr. Horn to the LZ": "Đưa TS Horn tới LZ",
    "RESCUED: Dr. Thomas Horn": "ĐÃ CỨU: TS. T. Horn",
    "Dr. Thomas Horn doesn't look like he's in the best physical condition, but if his mind is still sharp, he could still help pull us out of this thing.": "TS. Horn thể trạng không tốt, nhưng nếu tâm trí còn minh mẫn, ông ấy vẫn có thể giúp kéo ta ra khỏi thảm cảnh này.",
    "He's alive ... for now.": "Hiện còn sống.",
    "Help Kilo bring in a big haul of supplies.": "Giúp Kilo mang về nhiều vật tư.",
    "Supply Run with Kilo": "Gom đồ cùng Kilo",
    "YES. We may be here for the long haul.": "ĐỒNG Ý. Ta sẽ ở đây lâu.",
    "NO. He needs to complete this on his own.": "KHÔNG. Để cậu ta tự làm.",
    "DELAY. Maybe later.": "ĐỢI. Để sau.",
    "Kilo is scavenging for supplies. Help him out?": "Kilo đang đi gom vật tư. Giúp không?",
    "Kilo went out on a supply run and found a really nice stash of resources. He'd like some help getting it back to base.": "Kilo đi gom vật tư và tìm thấy kho tài nguyên lớn. Cậu ta cần người giúp mang về căn cứ.",
    "Help Kilo get some supplies back to base.": "Giúp Kilo mang vật tư về căn cứ.",
    "Friend and confidant to Major Hawkes since Afghanistan.": "Tri kỷ của Thiếu tá Hawkes từ Afghanistan.",
    "Sergeant Kilohana Young": "Trung sĩ K. Young",
    "Kilo and I have worked together since I was a new Lieutenant in Afghanistan. He's always been someone I could trust to get things done. Now that the world is falling apart, he's one of the only solid things I have left to lean on.": "Kilo và tôi sát cánh từ khi tôi làm Trung úy ở Afghanistan. Cậu ấy luôn là người tôi tin cậy. Khi thế giới sụp đổ, cậu ấy là điểm tựa vững chắc hiếm hoi tôi còn lại.",
    "I would trust Kilo with my life.": "Giao mạng sống cho Kilo.",
    "Kilo (Kilohana Young) is now playable.": "Có thể điều khiển Kilo.",
    "Kilo and I have worked together since I was a new Lieutenant in Afghanistan. I don't know what I'm going to tell his wife and his daughters. They're so far away ... can I even get a message to them anymore?": "Kilo và tôi kề vai từ thời Afghanistan. Tôi không biết sẽ nói gì với vợ con cậu ấy nữa. Họ ở quá xa... liệu tôi còn gửi được tin cho họ không?",
    "Kilo was killed.": "Kilo đã mất",
    "Sergeant Kilohana Young. My friend. Killed in action.": "Trung sĩ Kilohana Young. Bạn tôi. Tử trận.",
    "Dude is now missing.": "Đã mất tích.",
    "EXPIRED: Scavengers": "Trễ: Gom đồ",
    "Word on the wireless is %1$s made it home with those supplies. Seemed kinda miffed about not getting any help, though. - %2$s": "Tin radio báo %1$s đã đem vật tư về. Trông có vẻ hơi bực vì không được ai giúp đỡ. - %2$s",
    "%1$s survived.": "%1$s sống.",
    "-10 Friendship.": "-10 Bạn bè.",
    "The supplies made it home safe, but %1$s isn't too happy about having to do it alone. - %2$s": "Vật tư về nhà an toàn, nhưng %1$s không vui khi phải làm một mình. - %2$s",
    "You can scratch that supply run out of your day planner... and expect some harsh words from %1$s. Something about being hung out to dry? - %2$s": "Có thể gạch nhiệm vụ khỏi lịch... và chuẩn bị nghe %1$s cằn nhằn chuyện bỏ rơi đồng đội. - %2$s",
    "%1$s got home with the supplies, but it was a close call. - %2$s": "%1$s mang được vật tư về, suýt mất mạng. - %2$s",
    "Infestation destroyed": "Diệt ổ dịch",
    "%1$s ran into some trouble, but at least they got the supplies home. - %2$s": "%1$s gặp rắc rối, nhưng ít nhất đã mang vật tư về. - %2$s",
    "%1$s ran into some trouble on the way home from a scavenging run. Probably could have used our help. - %2$s.": "%1$s gặp rắc rối trên đường về sau chuyến gom đồ. Lẽ ra nên có ta giúp. - %2$s.",
    "%1$s's supply run shouldn't have taken this long. Their people are freaking out. - %2$s": "%1$s gom đồ quá lâu. Ở nhà đang lo sốt vó. - %2$s"
  },
  "00030": {
    "Things didn't go well.": "Mọi chuyện tệ.",
    "%1$s got attacked on that supply run. Tried to fight them off, but without backup.... - %2$s": "%1$s bị tấn công khi gom đồ. Cố tự vệ nhưng không có yểm trợ.... - %2$s",
    "Nobody's been able to raise %1$s on the radio. Supply runs shouldn't take this long... right? - %2$s.": "Không ai bắt được sóng của %1$s. Gom đồ không lâu thế... phải không? - %2$s.",
    "EXPIRED: Supply Run with Kilo": "HẾT HẠN: Kilo gom đồ",
    "Kilo brought the supplies back to base on his own. He's been really withdrawn lately, worrying about his family. He snaps at Vince more than usual. I wish I'd been there to support him.": "Kilo tự mang đồ về. Gần đây cậu ấy khép kín, lo cho gia đình và hay gắt gỏng với Vince. Ước gì tôi đã ở đó giúp cậu ấy.",
    "Missed a chance to help a friend.": "Lỡ cơ hội giúp bạn bè.",
    "Help Kilo Scavenge": "Kilo gom đồ",
    "Rescue Julene Horn": "Cứu Julene Horn",
    "START MISSION. Earn Trust and Influence.": "BẮT ĐẦU. Kiếm Tin tưởng.",
    "We're in this together.": "Ta cùng phe mà.",
    "CANCEL MISSION. Spend Influence to prevent the attempt. It's safer to just leave it, right?": "HỦY. Dùng Uy tín ngăn lại. Để mặc có vẻ an toàn hơn đúng không?",
    "Leave it alone.": "Mặc kệ.",
    "Not right now.": "Để sau.",
    "Want to help clear an infestation?": "Muốn dọn ổ dịch không?",
    "ASSET PROFILE: Dr. Julene Horn": "HỒ SƠ: TS. Julene Horn",
    "Surgeon. Former wife of Dr. Thomas Horn. May have critical knowledge of her husband's research. Her ground evac was stranded on the highway on the other side of town.": "Bác sĩ ngoại khoa. Vợ cũ TS. Horn. Có thể biết rõ nghiên cứu của chồng. Xe sơ tán của bà bị kẹt trên cao tốc bên kia thị trấn.",
    "Can she help us with her husband's work?": "Bà ấy giúp được gì không?",
    "Surgeon at University Medical. Ex-wife of Dr. Thomas Horn.": "Bác sĩ ngoại khoa ĐH Y. Vợ cũ của TS. Horn.",
    "%+d Friendship with Everyone at Home": "%+d Bạn bè với cả nhà",
    "RESCUED: Dr. Julene Horn": "ĐÃ CỨU: TS. J. Horn",
    "Dr. Horn has provided us with materials that may help to reconstruct her ex-husband's research.\r\nRescued with %1$s, a colleague at University Medical.": "Bác sĩ Horn đưa ta tài liệu có thể dựng lại nghiên cứu của chồng cũ.\r\nĐược cứu cùng %1$s, đồng nghiệp tại ĐH Y.",
    "Plus her colleague, %1$s.": "Cùng %1$s.",
    "EXPIRED: Dr. Julene Horn": "HẾT HẠN: TS. J. Horn",
    "We left Julene Horn alone on the highway, and now the zeds have got her. So far our record with the Horn family is 0 for 2. If they had any kids, let's hope they're far away from here.": "Ta bỏ mặc Julene trên cao tốc, giờ zombie đã xé xác bà. Đến nay tỷ số với nhà Horn là 0-2. Nếu họ có con, mong chúng ở thật xa nơi này.",
    "Dead on the highway.": "Chết trên lộ.",
    "KILLED: Dr. Julene Horn": "TS. J. Horn ĐÃ CHẾT",
    "Julene Horn died during our attempt to rescue her. So far our record with the Horn family is 0 for 2. If they had any kids, let's hope they're far away from here.": "Julene Horn chết khi ta cố cứu bà. Đến nay tỷ số với nhà Horn là 0-2. Nếu họ có con, mong chúng ở thật xa nơi này.",
    "THE OTHER DOCTOR": "BÁC SĨ KHÁC",
    "Go to House": "Đến Nhà",
    "Get to the Horn house": "Đến nhà Horn",
    "Clear Infestation": "Dọn ổ dịch",
    "Clear the Infestation": "Dọn ổ dịch",
    "Gather Notes": "Gom sổ tay",
    "Help Dr. Horn collect the notes": "Giúp TS. Horn gom ghi chép",
    "Under Siege": "Vây hãm",
    "The helicopter flights we're making in and out of the base are turning us into a beacon for the zeds. They seem to come in waves. Once they exhaust their numbers in a major siege, we get a breather to rest and rearm before they attack again.": "Các chuyến trực thăng ra vào căn cứ biến ta thành bia thu hút zombie. Chúng tràn tới theo đợt. Khi diệt sạch chúng trong đợt vây hãm, ta có thời gian nghỉ và tiếp đạn trước đợt sau.",
    "Zombies are about to overrun the base!": "Zombie sắp tràn ngập căn cứ!",
    "Survive the Zombie Siege": "Trụ qua vây hãm",
    "%+d Trust with these survivors.": "%+d Tin tưởng từ họ.",
    "THREAT LEVEL HIGH": "NGUY HIỂM CAO"
  }
};

function utf8ByteLength(value) {
    return Buffer.byteLength(String(value ?? ""), "utf8");
}

function placeholdersMatch(source, translated) {
    const extractPlaceholders = (text) => {
        const tokens = [];
        const regex = /(\{\d+\}|%[0-9\$]*[sd]|\n|##|<[^>]+>|\[[^\]]+\])/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            tokens.push(match[0]);
        }
        return tokens.sort();
    };
    const srcTokens = extractPlaceholders(source);
    const dstTokens = extractPlaceholders(translated);
    if (srcTokens.length !== dstTokens.length) return false;
    for (let i = 0; i < srcTokens.length; i++) {
        if (srcTokens[i] !== dstTokens[i]) return false;
    }
    return true;
}

function runValidation() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error('No input_batch.json found.');
        process.exit(1);
    }
    const inputBatch = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    const outputBatch = [];
    const errors = [];

    for (const inJob of inputBatch) {
        const outStrings = [];
        const jobTrans = translations[inJob.id];

        if (!jobTrans) {
            errors.push(`[ERROR] Missing translations for job ${inJob.id}`);
            continue;
        }

        for (const item of inJob.strings) {
            const transText = jobTrans[item.source];
            if (!transText) {
                errors.push(`[ERROR] Job ${inJob.id}: Missing translation for source: "${item.source}"`);
                continue;
            }

            const limit = item.maxUtf8Bytes;
            const len = utf8ByteLength(transText);
            const diff = len - limit;

            if (diff > 0) {
                errors.push(`[ERROR] Job ${inJob.id}: Translation too long by ${diff} bytes! Limit: ${limit}, Actual: ${len}\n  Src: "${item.source}"\n  Trs: "${transText}"`);
            }

            if (!placeholdersMatch(item.source, transText)) {
                errors.push(`[ERROR] Job ${inJob.id}: Placeholders mismatch!\n  Src: "${item.source}"\n  Trs: "${transText}"`);
            }

            outStrings.push({
                source: item.source,
                translation: transText
            });
        }

        outputBatch.push({
            id: inJob.id,
            strings: outStrings
        });
    }

    if (errors.length > 0) {
        fs.writeFileSync('jobs/validation_errors.txt', errors.join('\n\n'), 'utf8');
        console.error(`\nValidation FAILED with ${errors.length} errors. Saved details to jobs/validation_errors.txt`);
        process.exit(1);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputBatch, null, 2), 'utf8');
    console.log(`\nValidation successful! Saved output to ${OUTPUT_FILE}`);
}

runValidation();
