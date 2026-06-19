import fs from "node:fs";
import { replaceXmlStrings } from "../tools/lib/strings.js";

const translations = new Map([
  ["TIP: Hold [sprint] to sprint.", "MẸO: Giữ [sprint] để chạy nước rút."],
  ["TIP: Hold [v_moveforward] to accelerate. [v_moveback] to brake or drive in reverse.", "MẸO: Giữ [v_moveforward] để tăng tốc. [v_moveback] để phanh hoặc lùi."],
  ["TIP: Hold [v_brake] for the handbrake. Press [vehicle.ul_melee_attack] for a door attack.", "MẸO: Giữ [v_brake] kéo phanh tay. Nhấn [vehicle.ul_melee_attack] để mở cửa tấn công."],
  ["You've taken a lot of damage, reducing your MAXIMUM VITALITY.", "Bạn đã chịu quá nhiều sát thương, làm giảm SINH LỰC TỐI ĐA."],
  ["TIP: Return home and let someone else take over.", "MẸO: Trở về nhà và để người khác làm thay."],
  ["TIP: Once you fully SEARCH this building, you can set up an OUTPOST here.", "MẸO: LỤC SOÁT hoàn toàn tòa nhà này để có thể thiết lập TIỀN ĐỒN."],
  ["TIP: Radio home using [ul_radio_menu] to create an OUTPOST here.", "MẸO: Gọi radio bằng [ul_radio_menu] để thiết lập TIỀN ĐỒN tại đây."],
  ["TIP: Radio home using [xi_dpad_down] (D-pad) to create an OUTPOST here.", "MẸO: Gọi radio bằng [xi_dpad_down] (D-pad) để thiết lập TIỀN ĐỒN tại đây."],
  ["TIP: Outposts create a small SAFE AREA and can be visited to RESUPPLY.", "MẸO: Tiền đồn tạo ra một KHU VỰC AN TOÀN nhỏ và là nơi để TIẾP TẾ."],
  ["TIP: Radio home using [ul_radio_menu] to relocate your home base.", "MẸO: Gọi radio bằng [ul_radio_menu] để dời cứ điểm."],
  ["TIP: Radio home using [xi_dpad_down] (D-pad) to relocate your home base.", "MẸO: Gọi radio bằng [xi_dpad_down] (D-pad) để dời cứ điểm."],
  ["TIP: If you relocate, you will abandon your current home.", "MẸO: Nếu dời đi, bạn sẽ bỏ lại cứ điểm hiện tại."],
  ["TIP: Hold [sprint] to ascend or descend a ladder faster.", "MẸO: Giữ [sprint] để trèo thang nhanh hơn."],
  ["TIP: Hold [cover] to crouch down and make yourself harder to spot.", "MẸO: Giữ [cover] để ngồi xổm và tránh bị phát hiện."],
  ["TIP: Press [ul_journal_menu] to open your journal and view inventory, skills, and community info.", "MẸO: Nhấn [ul_journal_menu] mở sổ tay xem túi đồ, kỹ năng và cộng đồng."],
  ["TIP: Press [xi_dpad_up] (D-pad) open your journal and view inventory, skills, and community info.", "MẸO: Nhấn [xi_dpad_up] (D-pad) mở sổ tay xem túi đồ, kỹ năng và cộng đồng."],
  ["TIP: Press [ul_radio_menu] use your radio to call in favors.", "MẸO: Nhấn [ul_radio_menu] dùng bộ đàm gọi hỗ trợ."],
  ["TIP: Press [xi_dpad_down] (D-pad) use your radio to call in favors.", "MẸO: Nhấn [xi_dpad_down] (D-pad) dùng bộ đàm gọi hỗ trợ."],
  ["TIP: Press [crouch] to turn your flashlight on or off.", "MẸO: Nhấn [crouch] để bật/tắt đèn pin."],
  ["TIP: Click [crouch] to turn your flashlight on or off.", "MẸO: Nhấn [crouch] để bật/tắt đèn pin."],
  ["TIP: Press [v_lights] to turn your headlights on or off.", "MẸO: Nhấn [v_lights] để bật/tắt đèn xe."],
  ["TIP: Click [v_lights] to turn your headlights on or off.", "MẸO: Nhấn [v_lights] để bật/tắt đèn xe."],
  ["TIP: Hold [emote_hold] to see character names and perform emotes.", "MẸO: Giữ [emote_hold] để xem tên nhân vật và biểu diễn cảm xúc."],
  ["TIP: Experiment with the different emotes your character can perform. Press [emote1], [emote2], [emote3], or [emote4].", "MẸO: Thử biểu cảm nhân vật. Nhấn [emote1], [emote2], [emote3] hoặc [emote4]."],
  ["TIP: Experiment with the different emotes your character can perform. Hold [xi_triggerr] then press [xi_a], [xi_b], [xi_x], or [xi_y].", "MẸO: Thử biểu cảm nhân vật. Giữ [xi_triggerr] rồi nhấn [xi_a], [xi_b], [xi_x] hoặc [xi_y]."],
  ["Drive to the parking area of your base, and any rucksacks in your vehicle will be delivered automatically.", "Lái xe vào khu vực đậu xe của cứ điểm, ba lô trong xe sẽ tự động được cất vào kho."],
  ["TIP: Press [xi_use] to open or close a door.", "MẸO: Nhấn [xi_use] để mở hoặc đóng cửa."],
  ["TIP: Hold [xi_use] to build a barricade.", "MẸO: Giữ [xi_use] để gia cố rào chắn."],
  ["TIP: Press [xi_use] to check for supplies.", "MẸO: Nhấn [xi_use] để kiểm tra nhu yếu phẩm."],
  ["TIP: Spend INFLUENCE to take items.", "MẸO: Tiêu tốn ẢNH HƯỞNG để lấy đồ."]
]);

const OUTPUT_FILE = "output/gamedata/libs/class3/contentmanager/hints.xml";
const INPUT_FILE = "input/gamedata/libs/class3/contentmanager/hints.xml";

const sourceXml = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, "utf8") : fs.readFileSync(INPUT_FILE, "utf8");
const translatedXml = replaceXmlStrings(sourceXml, translations);

if (!fs.existsSync("output/gamedata/libs/class3/contentmanager")) {
  fs.mkdirSync("output/gamedata/libs/class3/contentmanager", { recursive: true });
}
fs.writeFileSync(OUTPUT_FILE, translatedXml);

console.log(`Translated 30 strings in ${OUTPUT_FILE}`);
