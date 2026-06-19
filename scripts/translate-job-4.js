import fs from "node:fs";
import { replaceXmlStrings } from "../tools/lib/strings.js";

const translations = new Map([
  ["TIP: Press [ul_melee_attack] repeatedly to force open a locked door.", "MẸO: Nhấn liên tục [ul_melee_attack] để phá cửa đang khóa."],
  ["TIP: Move into a bush while crouched to hide completely.", "MẸO: Di chuyển vào bụi rậm khi ngồi xổm để ẩn nấp hoàn toàn."],
  ["You are HIDDEN. Remain in cover to avoid detection.", "Bạn đang ẨN NẤP. Hãy ở trong chỗ nấp để tránh bị phát hiện."],
  ["TIP: Press [ui_click] to set or clear a waypoint.", "MẸO: Nhấn [ui_click] để đặt hoặc xóa điểm đánh dấu."],
  ["You are DROWNING. Get out of the water.", "Bạn đang bị ĐUỐI NƯỚC. Hãy mau ra khỏi nước."],
  ["YOU ARE ENCUMBERED", "BẠN ĐANG MANG QUÁ NẶNG"],
  ["YOU ARE NO LONGER ENCUMBERED", "BẠN HẾT MANG NẶNG"],
  ["TIP: Your mobility and stamina are penalized if you carry too much weight.", "MẸO: Độ linh hoạt và thể lực sẽ bị giảm nếu mang đồ quá nặng."],
  ["You are still ENCUMBERED. Stamina will drain rapidly while sprinting.", "Bạn vẫn đang MANG QUÁ NẶNG. Thể lực sẽ sụt giảm nhanh chóng khi chạy nước rút."],
  ["Your game is not being saved. Complete the mission to save your progress.", "Trò chơi chưa được lưu. Hoàn thành nhiệm vụ để lưu tiến trình."],
  ["TIP: Your game is not saved while you are on a mission. Complete the mission to save your progress.", "MẸO: Trò chơi sẽ không được lưu khi đang làm nhiệm vụ. Hoàn thành nhiệm vụ để lưu tiến trình."],
  ["TIP: Press [jump] repeatedly to get up.", "MẸO: Nhấn liên tục [jump] để đứng dậy."],
  ["TIP: Tap [cover] repeatedly to break free.", "MẸO: Nhấn liên tục [cover] để vùng vẫy thoát ra."],
  ["Use [moveforward], [moveleft], [moveback], [moveright] to move.", "Dùng [moveforward], [moveleft], [moveback], [moveright] để di chuyển."],
  ["Use [xi_thumblx] to move.", "Dùng [xi_thumblx] để di chuyển."],
  ["Use the mouse to look around.", "Dùng chuột để nhìn xung quanh."],
  ["Use [xi_thumbrx] to look around.", "Dùng [xi_thumbrx] để nhìn xung quanh."],
  ["TIP: Press [ul_melee_attack] to attack. Press [cover] to defend.", "MẸO: Nhấn [ul_melee_attack] để tấn công. Nhấn [cover] để phòng thủ."],
  ["TIP: Press [jump] to jump and climb.", "MẸO: Nhấn [jump] để nhảy và trèo."],
  ["TIP: Press [execute] to shove an enemy away.", "MẸO: Nhấn [execute] để xô ngã kẻ thù."],
  ["TIP: Press [sprint] + [xi_use] to shove an enemy away.", "MẸO: Nhấn [sprint] + [xi_use] để xô ngã kẻ thù."],
  ["Approach a container and press [xi_use] to search it.", "Tiến lại gần đồ vật và nhấn [xi_use] để lục soát."],
  ["TIP: Hold [sprint] to sprint. Press [jump] to jump and climb.", "MẸO: Giữ [sprint] để chạy nước rút. Nhấn [jump] để nhảy và trèo."],
  ["Hold [cover] to crouch down and make yourself harder to spot.", "Giữ [cover] để ngồi xổm và tránh bị phát hiện."],
  ["You can switch between Maya and Marcus in the Community tab of your journal. Press [ul_journal_menu] to open your journal.", "Bạn có thể đổi giữa Maya và Marcus ở trang Cộng Đồng trong Sổ Tay. Nhấn [ul_journal_menu] để mở."],
  ["You can switch between Maya and Marcus in the Community tab of your journal. Press [xi_dpad_up] (D-pad) to open your journal.", "Bạn có thể đổi giữa Maya và Marcus ở trang Cộng Đồng trong Sổ Tay. Nhấn [xi_dpad_up] (D-pad) để mở."],
  ["Hold [ul_aim] to aim your gun.", "Giữ [ul_aim] để ngắm bắn súng."],
  ["Press [ul_map_menu] to view your Map.", "Nhấn [ul_map_menu] để mở Bản Đồ."],
  ["TIP: Surveying adds buildings and other points of interest to your map.", "MẸO: Quan sát từ trên cao giúp hiển thị các tòa nhà và điểm thú vị lên bản đồ."],
  ["You can search all of these locations for resources, weapons, and other survivors.", "Bạn có thể lục soát các khu vực này để tìm tài nguyên, vũ khí, và những người sống sót khác."]
]);

const OUTPUT_FILE = "output/gamedata/libs/class3/contentmanager/hints.xml";
const INPUT_FILE = "input/gamedata/libs/class3/contentmanager/hints.xml";

const sourceXml = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, "utf8") : fs.readFileSync(INPUT_FILE, "utf8");
const translatedXml = replaceXmlStrings(sourceXml, translations);

fs.writeFileSync(OUTPUT_FILE, translatedXml);
console.log(`Translated 30 strings in ${OUTPUT_FILE}`);
