import fs from "node:fs";
import { replaceXmlStrings } from "../tools/lib/strings.js";

const translations = new Map([
  ["Time to upgrade your Home! Press [ul_journal_menu] to open your Journal and build new Facilties on the Home page.", "Đã đến lúc nâng cấp Cứ Điểm! Nhấn [ul_journal_menu] mở Sổ Tay và xây dựng cơ sở vật chất mới ở trang Cứ Điểm."],
  ["Time to upgrade your Home! Press D-pad [xi_dpad_up] to open your Journal and build new Facilties on the Home page.", "Đã đến lúc nâng cấp Cứ Điểm! Nhấn D-pad [xi_dpad_up] mở Sổ Tay và xây dựng cơ sở vật chất mới ở trang Cứ Điểm."],
  ["The Home page is where you can view, build, and upgrade your Community's Facilities. Use the mouse to select a Facility Slot and get more information about the bonuses it provides and the actions available.\r\nAn Infirmary is critical when it comes to dealing with disease and injury; meanwhile a Garden will keep everyone fed, and a Watchtower will keep everyone safe.", "Trang Cứ Điểm là nơi xem, xây dựng và nâng cấp cơ sở vật chất. Dùng chuột chọn Ô trống để xem thông tin về lợi ích và hành động của cơ sở đó.\r\nBệnh Xá rất quan trọng để đối phó với bệnh tật và thương tích; Vườn Trồng Trọt cung cấp thức ăn, và Tháp Canh giúp giữ an toàn cho mọi người."],
  ["The Home page is where you can view, build, and upgrade your Community's Facilities.  Use the D-Pad to select a Facility Slot and press [xi_a] to get more information about the bonuses it provides and the actions available.\r\nAn Infirmary is critical when it comes to dealing with disease and injury; meanwhile a Garden will keep everyone fed, and a Watchtower will keep everyone safe.", "Trang Cứ Điểm là nơi xem, xây dựng và nâng cấp cơ sở vật chất. Dùng D-Pad chọn Ô trống và nhấn [xi_a] để xem thông tin về lợi ích và hành động của cơ sở đó.\r\nBệnh Xá rất quan trọng để đối phó với bệnh tật và thương tích; Vườn Trồng Trọt cung cấp thức ăn, và Tháp Canh giúp giữ an toàn cho mọi người."],
  ["You've added survivors to your Community! Press [ul_journal_menu] to open your Journal and learn about making Friends on the Community page.", "Đã nhận thêm người sống sót! Nhấn [ul_journal_menu] mở Sổ Tay và tìm hiểu cách kết bạn ở trang Cộng Đồng."],
  ["You've added survivors to your Community! Press D-pad [xi_dpad_up] to open your Journal and learn about making Friends on the Community page.", "Đã nhận thêm người sống sót! Nhấn D-pad [xi_dpad_up] mở Sổ Tay và tìm hiểu cách kết bạn ở trang Cộng Đồng."],
  ["You can become Friends with many characters in the game after earning their full Trust. Your level of Trust with each character is represented by the green gauge. You can earn Trust with characters by helping them out on Missions and keeping the Community defended and well provisioned.\r\nWhen a character becomes your Friend you can play as that character by highlighting his or her portrait and pressing [ui_x] to \"Switch to...\"", "Bạn có thể Kết Bạn với nhiều nhân vật nếu đạt được Niềm Tin tuyệt đối. Thanh màu xanh lá biểu thị mức Niềm Tin. Kiếm Niềm Tin bằng cách giúp họ làm Nhiệm Vụ, bảo vệ cứ điểm và giữ nguồn cung cấp ổn định.\r\nKhi thành Bạn Bè, bạn có thể điều khiển nhân vật đó bằng cách chọn ảnh đại diện và nhấn [ui_x] để \"Chuyển sang...\""],
  ["Resource Bundles\r\nWhile searching you will occasionally find a bundle of resources that can be brought back to your home and added to your Community's Stockpile.  Press [ui_click] to load it up and take it yourself, or press [ui_use] to radio in for some scavengers to take it for you.\r\nAlternatively you can press [ui_x] to break it open to get consumables of that resource type instead of adding it to your Community's Stockpile.", "Tài Nguyên\r\nKhi lục soát, thỉnh thoảng bạn sẽ tìm thấy kho Tài Nguyên để mang về Kho Dự Trữ. Nhấn [ui_click] để tự vác lên lưng, hoặc nhấn [ui_use] gọi bộ đàm nhờ người đi lấy hộ.\r\nHoặc nhấn [ui_x] để phá vỡ và lấy các vật phẩm tiêu hao bên trong thay vì đưa vào Kho Dự Trữ."],
  ["You'll need Food to prevent hunger, Medicine to ward off disease, Ammo to defend yourselves, Building Materials to construct new Facilities, and Fuel for projects in your Workshop.\r\nStockpiles are adjusted every real-world day. The daily adjustment is determined by your Facilities, Population, and Outposts.", "Bạn cần Thức Ăn chống đói, Thuốc trị bệnh, Đạn để phòng thủ, Vật Liệu để xây dựng, và Nhiên Liệu cho Xưởng.\r\nKho dự trữ sẽ tiêu hao sau mỗi ngày thật (real-world day). Mức độ thay đổi tùy thuộc vào Cơ Sở, Dân Số, và Tiền Đồn của bạn."],
  ["You've unlocked an Extra! Press [xi_dpad_left] and [xi_dpad_right] to switch between the Radio channel and the Extras channel.", "Vừa mở khóa một Nội Dung Phụ! Nhấn [xi_dpad_left] và [xi_dpad_right] để chuyển giữa kênh Radio và kênh Nội Dung Phụ."],
  ["TIP: Tap [cover] to defend.", "MẸO: Nhấn [cover] để phòng thủ."],
  ["TIP: Press [roll] to roll.", "MẸO: Nhấn [roll] để lộn nhào."],
  ["TIP: Press [sprint] + [cover] to roll.", "MẸO: Nhấn [sprint] + [cover] để lộn nhào."],
  ["TIP: Press [ul_melee_attack] to attack.", "MẸO: Nhấn [ul_melee_attack] để tấn công."],
  ["TIP: Press [xi_use] to kick an enemy away from you.", "MẸO: Nhấn [xi_use] để đá văng kẻ thù."],
  ["TIP: Press [vehicle.ul_melee_attack] repeatedly to knock an enemy off the car door.", "MẸO: Nhấn liên tục [vehicle.ul_melee_attack] để hất văng kẻ thù bám ở cửa xe."],
  ["TIP: Press [jump] for a longer range attack.", "MẸO: Nhấn [jump] để thực hiện đòn tấn công tầm xa hơn."],
  ["TIP: Press [execute] to finish off a downed foe.", "MẸO: Nhấn [execute] để kết liễu kẻ thù đang gục ngã."],
  ["TIP: Press [sprint] + [xi_use] to finish off a downed foe.", "MẸO: Nhấn [sprint] + [xi_use] để kết liễu kẻ thù đang gục ngã."],
  ["Hold [ul_aim] to aim. Press [ul_shoot] to shoot.", "Giữ [ul_aim] để ngắm. Nhấn [ul_shoot] để bắn."],
  ["Hold [ul_aim] to aim. Pull [ul_shoot] to shoot.", "Giữ [ul_aim] để ngắm. Kéo [ul_shoot] để bắn."],
  ["Press [aim.reload] to reload.", "Nhấn [aim.reload] để nạp đạn."],
  ["Press [aim.reload] to unjam your gun.", "Nhấn [aim.reload] để gỡ kẹt đạn."],
  ["Press [camera] to toggle zoom with scoped weapons.", "Nhấn [camera] để bật/tắt ống ngắm (nếu có)."],
  ["Click in on [camera] to toggle zoom with scoped weapons.", "Nhấn [camera] để bật/tắt ống ngắm (nếu có)."],
  ["Tap [jump] while aiming to cycle fire modes with capable weapons.", "Nhấn [jump] khi ngắm để đổi chế độ bắn (nếu súng hỗ trợ)."],
  ["TIP: Attach a suppressor to muffle your gunshots.", "MẸO: Gắn ống giảm thanh để tiếng súng nhỏ hơn."],
  ["TIP: Use an EXPLOSIVE or INCENDIARY to go out in a Blaze of Glory.", "MẸO: Dùng thuốc NỔ hoặc CHÁY để kết thúc một cách Huy Hoàng."],
  ["TIP: Press [execute] while sneaking to kill a zombie instantly", "MẸO: Nhấn [execute] khi đang lén lút để giết zombie ngay lập tức."],
  ["TIP: Hold [sprint] + [xi_use] while sneaking to kill a zombie instantly", "MẸO: Giữ [sprint] + [xi_use] khi lén lút để giết zombie ngay lập tức."]
]);

const OUTPUT_FILE = "output/gamedata/libs/class3/contentmanager/hints.xml";
const INPUT_FILE = "input/gamedata/libs/class3/contentmanager/hints.xml";

const sourceXml = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, "utf8") : fs.readFileSync(INPUT_FILE, "utf8");
const translatedXml = replaceXmlStrings(sourceXml, translations);

fs.writeFileSync(OUTPUT_FILE, translatedXml);
console.log(`Translated 30 strings in ${OUTPUT_FILE}`);
