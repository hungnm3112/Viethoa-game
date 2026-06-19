import fs from "node:fs";
import { replaceXmlStrings } from "../tools/lib/strings.js";

const hintsTranslations = new Map([
  // Job 5
  ["Use [ui_scroll_down] to cycle between Mission Opportunities.", "Dùng [ui_scroll_down] để chuyển đổi giữa các Cơ Hội Nhiệm Vụ."],
  ["Click [xi_thumbr] to cycle between Mission Opportunities.", "Nhấn [xi_thumbr] để chuyển đổi giữa các Cơ Hội Nhiệm Vụ."],
  ["Press [ui_click] to set a Waypoint.", "Nhấn [ui_click] để đặt Điểm Đánh Dấu."],
  ["You are now FATIGUED and have LOWER STAMINA.", "Bạn đang MỆT MỎI và bị GIẢM THỂ LỰC."],
  ["Spend INFLUENCE for extra supplies or to influence others.", "Tiêu ẢNH HƯỞNG để lấy thêm nhu yếu phẩm hoặc tác động lên người khác."],
  ["Use a firecracker to draw zombie attention to an area.", "Dùng pháo sáng để thu hút sự chú ý của zombie đến một khu vực."],
  ["TIP: Press [ul_journal_menu] and then [ui_lb] to view your HOME BASE.", "MẸO: Nhấn [ul_journal_menu] rồi nhấn [ui_lb] để xem CỨ ĐIỂM."],
  ["TIP: Press [xi_dpad_up] (D-pad) and then [xi_shoulderl] to view your HOME BASE.", "MẸO: Nhấn [xi_dpad_up] (D-pad) rồi nhấn [xi_shoulderl] để xem CỨ ĐIỂM."],
  ["TIP: Your top survival needs are FOOD, MEDICINE, and AMMUNITION.", "MẸO: Nhu cầu sinh tồn hàng đầu của bạn là THỨC ĂN, THUỐC MEN, và ĐẠN DƯỢC."],
  ["Acquired TRUCK KEYS and RADIO.", "Nhận được CHÌA KHÓA XE TẢI và BỘ ĐÀM."],
  ["Your equipped gun uses a different kind of ammunition.", "Súng bạn đang trang bị sử dụng loại đạn khác."],
  ["Your equipped gun is fully loaded.", "Súng bạn đang trang bị đã nạp đầy đạn."],
  ["Your inventory is FULL.", "Túi đồ của bạn đã ĐẦY."],
  ["This backpack is TOO SMALL to hold your current inventory.", "Ba lô này QUÁ NHỎ để chứa đồ đạc hiện tại của bạn."],
  ["Your gun already has a suppressor.", "Súng của bạn đã gắn ống giảm thanh rồi."],
  ["You must fully SEARCH a location before establishing an outpost there.", "Bạn phải LỤC SOÁT hoàn toàn khu vực trước khi lập tiền đồn ở đó."],
  ["You must be in a BUILDING to set up an outpost.", "Bạn phải ở trong một TÒA NHÀ để lập tiền đồn."],
  ["This building is TOO SMALL to fortify.", "Tòa nhà này QUÁ NHỎ để gia cố."],
  ["This is ALREADY an OUTPOST.", "Đây ĐÃ LÀ một TIỀN ĐỒN."],
  ["This location is OCCUPIED by someone else.", "Địa điểm này đã bị CHIẾM ĐÓNG bởi người khác."],
  ["Your community cannot support any more outposts.", "Cộng đồng của bạn không thể hỗ trợ thêm tiền đồn nào nữa."],
  ["The roads near you are too crowded.", "Các con đường gần bạn đang quá đông đúc."],
  ["Your community is NOT BUILDING anything right now.", "Cộng đồng của bạn KHÔNG XÂY DỰNG bất cứ thứ gì lúc này."],
  ["Your inventory is FULL. There's no room for an ARTILLERY MARKER.", "Túi đồ đã ĐẦY. Không còn chỗ cho ĐIỂM CHỈ THỊ PHÁO KÍCH."],
  ["Use this after your MAXIMUM STAMINA has been reduced.", "Dùng món này khi THỂ LỰC TỐI ĐA của bạn bị giảm."],
  ["Use this after your MAXIMUM VITALITY has been reduced.", "Dùng món này khi SINH LỰC TỐI ĐA của bạn bị giảm."],
  ["You've called in this favor too many times recently.", "Gần đây bạn đã gọi hỗ trợ này quá nhiều lần rồi."],
  ["This already is your home!", "Đây đã là nhà của bạn rồi!"],
  ["You need to wait a bit before doing this again.", "Bạn cần chờ một chút trước khi làm lại việc này."],
  ["You cannot do this while in combat.", "Bạn không thể làm việc này khi đang chiến đấu."],

  // Job 6
  ["You have already added Milo to this community once.", "Bạn đã thêm Milo vào cộng đồng này một lần rồi."],
  ["You already own everything here!", "Bạn đã sở hữu mọi thứ ở đây!"],
  ["You aren't near any supplies!", "Bạn không ở gần bất kỳ nhu yếu phẩm nào!"],
  ["A SUPPLY RUN is already in progress here.", "Một nhóm LẤY NHU YẾU PHẨM đang hoạt động ở đây."],
  ["There are NO KNOWN RESOURCES here.", "KHÔNG CÓ TÀI NGUYÊN nào được biết ở đây."],
  ["There are NO USABLE ITEMS in your inventory.", "KHÔNG CÓ VẬT PHẨM NÀO DÙNG ĐƯỢC trong túi đồ của bạn."],
  ["You do not have an item selected.", "Bạn chưa chọn vật phẩm nào."],
  ["Max stamina is full. Stimulants temporarily recover some of your max stamina.", "Thể lực tối đa đã đầy. Thuốc kích thích giúp phục hồi tạm thời thể lực tối đa."],
  ["You cannot switch to someone who is INJURED.", "Bạn không thể chuyển sang người đang BỊ THƯƠNG."],
  ["You cannot switch to someone who is DEAD.", "Bạn không thể chuyển sang người đã CHẾT."],
  ["Once you reach 100% TRUST you can become FRIENDS.", "Khi đạt 100% NIỀM TIN, bạn có thể trở thành BẠN BÈ."],
  ["You can SWITCH control to any of your FRIENDS.", "Bạn có thể CHUYỂN quyền điều khiển sang bất kỳ người BẠN nào."],
  ["It's hard to know how things stand when someone is MISSING.", "Thật khó để biết tình hình ra sao khi có người đang MẤT TÍCH."],
  ["It's hard to know how things stand when someone is FLEEING.", "Thật khó để biết tình hình ra sao khi có người đang BỎ TRỐN."],
  ["You cannot switch to someone who is BUSY.", "Bạn không thể chuyển sang người đang BẬN."],
  ["Some people are too INDEPENDENT to ever give 100% trust.", "Vài người quá ĐỘC LẬP để trao đi 100% niềm tin."],
  ["You must earn 100% trust before BEFRIENDING someone.", "Bạn phải có được 100% niềm tin trước khi KẾT BẠN với ai đó."],
  ["You can't reach your journal right now.", "Bạn không thể mở sổ tay lúc này."],
  ["The pages are too blood-soaked to read.", "Các trang giấy quá đẫm máu để đọc."],
  ["Some people are scared of books. Zombies, not so much.", "Vài người sợ sách. Nhưng zombie thì không hẳn."],
  ["This isn't the time for a little casual reading.", "Đây không phải lúc để đọc sách thư giãn."],
  ["You can't reach your radio right now.", "Bạn không thể lấy bộ đàm lúc này."],
  ["You can't reach your map right now.", "Bạn không thể xem bản đồ lúc này."],
  ["Supplies must be brought HOME for distribution.", "Nhu yếu phẩm phải được mang VỀ NHÀ để phân phát."],
  ["TIP: After exploring for a while, you will FATIGUE, lowering your available stamina.", "MẸO: Sau một lúc khám phá, bạn sẽ MỆT MỎI, làm giảm thể lực hiện có."],
  ["TIP: [ul_radio_menu] to talk to Pastor William again.", "MẸO: [ul_radio_menu] để nói chuyện lại với Mục sư William."],
  ["TIP: [xi_dpad_down] (D-pad) to talk to Pastor William again.", "MẸO: [xi_dpad_down] (D-pad) để nói chuyện lại với Mục sư William."],
  ["Use repeated or loud NOISE to create a DISTRACTION.", "Gây TIẾNG ỒN liên tục hoặc quá to để tạo ĐÁNH LẠC HƯỚNG."],
  ["Gunfire, explosions, firecrackers, and alarm clocks are just some of the ways to create a DISTRACTION.", "Tiếng súng, chất nổ, pháo sáng và đồng hồ báo thức là những cách để ĐÁNH LẠC HƯỚNG."],
  ["Leave the area.", "Rời khỏi khu vực."],

  // Job 7
  ["WIPED OUT: You and all your friends are DEAD.", "BỊ XÓA SỔ: Bạn và tất cả bạn bè đều đã CHẾT."],
  ["Returning Home", "Đang trở về nhà"],
  ["You have 30 minutes remaining in your trial. Press [xi_start] to unlock the full game.", "Bạn còn 30 phút chơi thử. Nhấn [xi_start] để mở khóa toàn bộ trò chơi."],
  ["You have 15 minutes remaining in your trial. Press [xi_start] to unlock the full game.", "Bạn còn 15 phút chơi thử. Nhấn [xi_start] để mở khóa toàn bộ trò chơi."],
  ["You have 5 minutes remaining in your trial. Press [xi_start] to unlock the full game.", "Bạn còn 5 phút chơi thử. Nhấn [xi_start] để mở khóa toàn bộ trò chơi."],
  ["You have 1 minute remaining in your trial. Press [xi_start] to unlock the full game.", "Bạn còn 1 phút chơi thử. Nhấn [xi_start] để mở khóa toàn bộ trò chơi."],
  ["TIP: Use painkillers to restore Vitality", "MẸO: Dùng thuốc giảm đau để phục hồi Sinh Lực"],
  ["TIP: Eat a snack for a temporary stamina boost.", "MẸO: Ăn nhẹ để tăng tạm thời thể lực."],
  ["TIP: [ul_prev_consumable] or [ul_next_consumable] to select an item. Press [item] to use the selected item.", "MẸO: [ul_prev_consumable] hoặc [ul_next_consumable] để chọn vật phẩm. Nhấn [item] để dùng vật phẩm đã chọn."],
  ["TIP: [xi_dpad_left] or [xi_dpad_right] (D-pad) to select an item. Press [xi_shoulderr] to use it.", "MẸO: [xi_dpad_left] hoặc [xi_dpad_right] (D-pad) để chọn vật phẩm. Nhấn [xi_shoulderr] để dùng nó."]
]);

const todoTranslations = new Map([
  // Job 8
  ["Lots of zombies in the area.", "Có quá nhiều zombie trong khu vực."],
  ["Too Many Infestations", "Quá Nhiều Ổ Dịch"],
  ["Too Many Hordes", "Quá Nhiều Bầy Đàn"],
  ["DANGER: Feral Sighting", "NGUY HIỂM: Phát hiện Feral (Kẻ Săn Mồi)"],
  ["DANGER: Juggernaut Sighting", "NGUY HIỂM: Phát hiện Juggernaut (Gã Khổng Lồ)"],
  ["It's best to tackle these in hand-to-hand combat. -%1$s", "Tốt nhất là đối phó với chúng bằng cận chiến. -%1$s"],
  ["DANGER: Armored Zed Sighting", "NGUY HIỂM: Phát hiện Zombie Bọc Thép"],
  ["DANGER: Army Zed Sighting", "NGUY HIỂM: Phát hiện Zombie Quân Đội"],
  ["DANGER: Bloater Sighting", "NGUY HIỂM: Phát hiện Bloater (Kẻ Nổ Khí Đá)"],
  ["CRISIS: Malnutrition (Need Food)", "KHỦNG HOẢNG: Suy dinh dưỡng (Cần Thức Ăn)"],
  ["Morale Issue: Sadness", "Vấn Đề Tinh Thần: Nỗi buồn"],
  ["Morale Issue: Anger", "Vấn Đề Tinh Thần: Tức giận"],
  ["Morale Issue: Fear", "Vấn Đề Tinh Thần: Nỗi sợ hãi"],
  ["Advice: Build a Sleeping Area", "Lời khuyên: Xây Khu Vực Ngủ"],
  ["Advice: Upgrade to Bunkhouse", "Lời khuyên: Nâng cấp lên Nhà Tập Thể"],
  ["Advice: Build a Garden", "Lời khuyên: Xây Vườn Trồng Trọt"],
  ["Advice: Build a Medical Area", "Lời khuyên: Xây Khu Y Tế"],
  ["Advice: Upgrade to Infirmary", "Lời khuyên: Nâng cấp lên Bệnh Xá"],
  ["Advice: Upgrade to Medical Lab", "Lời khuyên: Nâng cấp lên Phòng Thí Nghiệm Y Tế"],
  ["Advice: Build a Cooking Area", "Lời khuyên: Xây Khu Vực Nấu Ăn"],
  ["Advice: Establish More Outposts", "Lời khuyên: Lập thêm Tiền Đồn"],
  ["Advice: Establish An Outpost", "Lời khuyên: Lập Một Tiền Đồn"],
  ["Advice: Build a Training Area", "Lời khuyên: Xây Khu Huấn Luyện"],
  ["Advice: Upgrade to Dojo", "Lời khuyên: Nâng cấp lên Võ Đường"],
  ["Advice: Build a Work Area", "Lời khuyên: Xây Khu Vực Làm Việc"],
  ["Advice: Upgrade to Workshop", "Lời khuyên: Nâng cấp lên Xưởng"],
  ["Advice: Upgrade to Munitions Shop", "Lời khuyên: Nâng cấp lên Cửa Hàng Vũ Khí"],
  ["Advice: Upgrade to Machine Shop", "Lời khuyên: Nâng cấp lên Xưởng Cơ Khí"],
  ["Advice: Build a Watchtower", "Lời khuyên: Xây Tháp Canh"],
  ["Advice: Upgrade to Shooting Platform", "Lời khuyên: Nâng cấp lên Đài Bắn Tỉa"]
]);

const HINTS_OUTPUT = "output/gamedata/libs/class3/contentmanager/hints.xml";
const HINTS_INPUT = "input/gamedata/libs/class3/contentmanager/hints.xml";
const hintsXml = fs.existsSync(HINTS_OUTPUT) ? fs.readFileSync(HINTS_OUTPUT, "utf8") : fs.readFileSync(HINTS_INPUT, "utf8");
fs.writeFileSync(HINTS_OUTPUT, replaceXmlStrings(hintsXml, hintsTranslations));
console.log(`Translated hints.xml (Jobs 5-7)`);

const TODO_OUTPUT = "output/gamedata/libs/class3/contentmanager/todolist.xml";
const TODO_INPUT = "input/gamedata/libs/class3/contentmanager/todolist.xml";
const todoXml = fs.existsSync(TODO_OUTPUT) ? fs.readFileSync(TODO_OUTPUT, "utf8") : fs.readFileSync(TODO_INPUT, "utf8");
fs.writeFileSync(TODO_OUTPUT, replaceXmlStrings(todoXml, todoTranslations));
console.log(`Translated todolist.xml (Job 8)`);
