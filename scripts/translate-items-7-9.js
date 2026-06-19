import fs from "node:fs";
import { replaceXmlStrings } from "../tools/lib/strings.js";

const translatedStrings = [
  // Job 7
  "Được thiết kế cho cảnh sát và quân đội.",
  "Súng lục: Mk. 3 Target",
  "Được những tay bắn bia và thợ săn thú nhỏ ưa thích.",
  "Súng lục: OHWS 40",
  "Được các lực lượng đặc nhiệm sử dụng.",
  "Súng lục: P 229",
  "Phiên bản nhỏ gọn của P226.",
  "Súng lục: Tac Master 1911",
  "Khung súng 1911, được nâng cấp để bắn chính xác.",
  "Súng lục: X-Lock",
  "Đối thủ từ Hoa Kỳ cạnh tranh với dòng súng lục \"G\".",
  "Súng lục: X-Lock Tactical",
  "Phiên bản nhẹ và ngắn hơn của khẩu X-Lock.",
  "Súng lục: Bz75 ST",
  "Phiên bản nhỏ gọn phổ biến của khẩu Bz75.",
  "Súng lục: Carrier 1911",
  "Phiên bản ngắn, dùng để tự vệ của khẩu 1911.",
  "Súng côn: Snub Special 22",
  "Đáng tin cậy và rẻ tiền, một khẩu súng cổ điển.",
  "Súng côn: Viper P357",
  "Khẩu súng côn có lịch sử phục vụ lâu đời trong ngành cảnh sát.",
  "Súng côn: M 1917",
  "Khẩu súng cổ điển nhuốm màu thời gian từ những ngày cuối của Thế Chiến thứ nhất.",
  "Súng côn: Model 29",
  "Khẩu súng uy lực, đã trở thành huyền thoại trên phim ảnh.",
  "Súng côn: Toro Bravo",
  "Giống như một con bò tót hung dữ, khẩu này mang lại sức mạnh cực lớn.",
  "Súng côn: Anvil",
  "Dùng đạn .500 S&W, tạo ra sự uy hiếp và kinh hoàng.",
  "Súng côn: Blackbird",

  // Job 8
  "Chế tác hiện đại, lấy cảm hứng từ miền Tây hoang dã.",
  "Súng côn: Diplomat",
  "Ngắn, uy lực và đáng tin cậy.",
  "Súng côn: River Snake",
  "Uy lực. Có ống ngắm để tăng độ chính xác.",
  "Súng côn: Safari",
  "Bắn từ phía dưới của ổ đạn.",
  "Tiểu liên: MP 90",
  "Súng tiểu liên nhỏ gọn, thường dùng đạn 5.7mm, nay được điều chỉnh thành đạn 9mm.",
  "Tiểu liên: MPS 90B",
  "Phiên bản dân sự của khẩu MP 90. Có trang bị kính ngắm.",
  "Tiểu liên: MP5A3",
  "Súng tiểu liên biểu tượng, phổ biến trên toàn thế giới.",
  "Tiểu liên: M1A1",
  "Thiết kế nổi tiếng, cấu hình thời Thế Chiến II. (bản sao)",
  "Tiểu liên: Super Z",
  "Bước tiến mới trong kỹ thuật chế tạo, với thiết kế kiểu súng lục.",
  "Tiểu liên: M-10",
  "Khẩu súng ưa thích của mấy tên phản diện trên phim.",
  "Tiểu liên: Mini Uzi 22",
  "Tiết kiệm đạn, phiên bản cỡ đạn .22 của súng Uzi.",
  "Tiểu liên: MP7A1",
  "Phiên bản đạn 4.6mm được chuyển thành đạn 9mm. Có trang bị kính ngắm.",
  "Tiểu liên: P9 Forge",
  "Đôi khi được gọi là một phiên bản Uzi \"cải tiến\".",
  "Tiểu liên: PDS",
  "Sức mạnh đạn súng trường, trong một thiết kế kích cỡ súng tiểu liên.",
  "Tiểu liên: Samurai PDW",
  "Tiểu liên đạn 9mm dành cho Cảnh sát Liên bang.",
  "Tiểu liên: UMP40",

  // Job 9
  "Tiểu liên với sức công phá mạnh, được tạo ra để thay thế khẩu MP5.",
  "Tiểu liên: Uzi",
  "Ông lão sáu mươi tuổi này chưa có dấu hiệu nghỉ hưu đâu.",
  "Tiểu liên: MP5K",
  "Phiên bản MP5 nhỏ gọn, rất tuyệt cho những không gian chật hẹp.",
  "Tiểu liên: TMP9",
  "Súng tiểu liên của Thụy Sĩ, có họ hàng với khẩu P9 Forge.",
  "Súng trường: Mk.16 Mod.0",
  "Súng trường chiến đấu của Lực lượng Đặc nhiệm. Được trang bị ống ngắm kép.",
  "Súng trường: AR 15",
  "Phiên bản dân sự của khẩu M4.",
  "Súng trường: AKMS",
  "Phiên bản lính dù của dòng súng AK.",
  "Súng trường: AR 15 Custom",
  "Một khẩu AR15 với một vài trang bị mới.",
  "Súng trường: AK47",
  "Khẩu súng trường chiến đấu huyền thoại.",
  "Súng trường: 416D",
  "Hệ thống trích khí ngắn cực kỳ đáng tin cậy. Có ống ngắm.",
  "Súng trường: ACR",
  "Một khẩu súng trường đa dụng trên chiến trường.",
  "Súng trường: AK47 Custom",
  "Được tùy chỉnh với các phụ kiện bổ sung, có ống ngắm.",
  "Súng trường: M14",
  "Đã có hơn 50 năm lăn lộn trên chiến trường và vẫn còn đang tiếp tục.",
  "Súng trường: M16A4",
  "Vũ khí tiêu chuẩn của Thủy quân Lục chiến Hoa Kỳ. Bao ngầu.",
  "Súng trường: M4A1",
  "Súng trường tiêu chuẩn của quân đội Hoa Kỳ.",
  "Súng trường: M6 SBR"
];

const jobs = JSON.parse(fs.readFileSync("jobs/pending.json", "utf8"));
// Lấy các câu tiếng Anh từ Job 7, 8, 9 (index 6, 7, 8)
const englishStrings = [...jobs[6].strings, ...jobs[7].strings, ...jobs[8].strings];

const translationsMap = new Map();
englishStrings.forEach((en, i) => {
  translationsMap.set(en, translatedStrings[i]);
});

const OUTPUT_FILE = "output/gamedata/libs/class3/items/items.xml";
const INPUT_FILE = "input/gamedata/libs/class3/items/items.xml";

const sourceXml = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, "utf8") : fs.readFileSync(INPUT_FILE, "utf8");
const translatedXml = replaceXmlStrings(sourceXml, translationsMap);

fs.writeFileSync(OUTPUT_FILE, translatedXml);
console.log(`Translated ${englishStrings.length} strings in ${OUTPUT_FILE}`);
