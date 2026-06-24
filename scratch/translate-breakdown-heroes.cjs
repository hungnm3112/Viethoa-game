const fs = require('fs');
const path = require('path');

const DIR = 'input/languages/chunks';
const files = fs.readdirSync(DIR);

const dictionary = {
  "Choose Your Hero": "Chọn Nhân Vật",
  "The Believer": "Tín Đồ",
  "The Father": "Người Cha",
  "The Dealer": "Con Buôn",
  "The Scholar": "Học Giả",
  "The Tragedy": "Kẻ Bất Hạnh",
  "The Killer": "Sát Thủ",
  "The Sacrifice": "Vật Hiến Tế",
  "The Taskmaster": "Đốc Công",
  "The Hunter": "Thợ Săn",
  "The Mother": "Người Mẹ",
  "The Gunner": "Pháo Thủ",
  "The Survivor": "Người Sống Sót",
  "The Fighter": "Võ Sĩ",
  "The Sniper": "Lính Tỉa",
  "The Mercenary": "Lính Đánh Thuê",
  "The Ninja": "Nhẫn Giả",
  "The Scientist": "Nhà Khoa Học",
  "The Mute": "Kẻ Câm",
  "The Veteran": "Cựu Binh",
  "The Cop": "Cảnh Sát",
  "The Bruiser": "Gã Côn Đồ",
  "The Judge": "Thẩm Phán",
  "The Mentor": "Người Hướng Dẫn",
  "The Gardener": "Thợ Làm Vườn",
  "The Convict": "Tội Phạm",
  "The Surgeon": "Bác Sĩ Phẫu Thuật",
  "The Rebel": "Kẻ Nổi Loạn",
  "The Protégée": "Môn Đồ",

  "Collected 150 Resources at Breakdown Level 4 or Higher.": "Đã thu thập 150 Tài nguyên ở cấp độ Breakdown 4 trở lên.",
  "Earn 500 Fame. (Breakdown Level 1 or Higher)": "Kiếm được 500 Danh tiếng. (Cấp độ Breakdown 1 trở lên)",
  "Start a Scenario at Breakdown Level 3.": "Bắt đầu Màn chơi ở cấp độ Breakdown 3.",
  "Start a Scenario at Breakdown Level 2.": "Bắt đầu Màn chơi ở cấp độ Breakdown 2.",
  "Start a Scenario at Breakdown Level 4.": "Bắt đầu Màn chơi ở cấp độ Breakdown 4.",
  "Start a Scenario at Breakdown Level 5.": "Bắt đầu Màn chơi ở cấp độ Breakdown 5.",
  "Start a Scenario at Breakdown Level 6.": "Bắt đầu Màn chơi ở cấp độ Breakdown 6.",
  "Complete 3 Surveys. (Breakdown Level 2 or Higher)": "Hoàn thành 3 lần khảo sát. (Cấp độ Breakdown 2 trở lên)",
  "Go Out in a Blaze of Glory. (Breakdown Level 1 or Higher)": "Hi sinh một cách anh dũng. (Cấp độ Breakdown 1 trở lên)",
  "Go Out in a Blaze of Glory (Breakdown Level 1 or Higher).": "Hi sinh một cách anh dũng (Cấp độ Breakdown 1 trở lên).",
  "Went out in a Blaze of Glory at Breakdown Level 1 or Higher.": "Đã hi sinh một cách anh dũng ở cấp độ Breakdown 1 trở lên.",
  "Breakdown Level 1.": "Cấp độ Breakdown 1.",
  "Breakdown Level 2.": "Cấp độ Breakdown 2.",
  "Breakdown Level 3.": "Cấp độ Breakdown 3.",
  "Breakdown Level 4.": "Cấp độ Breakdown 4.",
  "Breakdown Level 5.": "Cấp độ Breakdown 5.",
  "Breakdown Level 6.": "Cấp độ Breakdown 6.",
  "Reach Breakdown Level 6.": "Đạt tới cấp độ Breakdown 6.",
  "Reached Breakdown Level 6.": "Đã đạt tới cấp độ Breakdown 6.",
  "Kill 50 Zombies with Assault Rifles. (Breakdown Level 4 or Higher)": "Giết 50 thây ma bằng Súng trường Tấn công. (Cấp độ Breakdown 4 trở lên)",
  "Executed 50 Stealth Kills at Breakdown Level 5 or Higher.": "Đã thực hiện 50 Pha ám sát lén lút ở cấp độ Breakdown 5 trở lên.",
  "Destroy 5 Juggernauts (Breakdown Level 5 or Higher).": "Tiêu diệt 5 Juggernaut (Cấp độ Breakdown 5 trở lên).",
  "Destroyed 5 Juggernauts at Breakdown Level 5 or Higher.": "Đã tiêu diệt 5 Juggernaut ở cấp độ Breakdown 5 trở lên.",
  "Kill 10 Screamers. (Breakdown Level 4 or Higher)": "Giết 10 Screamer. (Cấp độ Breakdown 4 trở lên)",
  "Execute 50 Stealth Kills (Breakdown Level 5 or Higher).": "Thực hiện 50 Pha ám sát lén lút (Cấp độ Breakdown 5 trở lên).",
  "Kill 100 Zombies with FIRE. (Breakdown Level 2 or Higher)": "Giết 100 thây ma bằng LỬA. (Cấp độ Breakdown 2 trở lên)",
  "Perform 50 Stealth Kills. (Breakdown Level 5 or Higher)": "Thực hiện 50 Pha ám sát lén lút. (Cấp độ Breakdown 5 trở lên)",
  "Kill 100 Zombies with Heavy Weapons. (Breakdown Level 4 or Higher)": "Giết 100 thây ma bằng Vũ khí hạng nặng. (Cấp độ Breakdown 4 trở lên)",
  "Grow 10 Food in the Garden. (Breakdown Level 3 or Higher)": "Trồng 10 Thức ăn trong Vườn. (Cấp độ Breakdown 3 trở lên)",
  "Kill a dying Community Member. (Breakdown Level 1 or Higher)": "Kết liễu một Thành viên cộng đồng đang hấp hối. (Cấp độ Breakdown 1 trở lên)",
  "Kill 5 Ferals. (Breakdown Level 3 or Higher)": "Giết 5 Feral. (Cấp độ Breakdown 3 trở lên)",
  "Prepare 12 Snacks. (Breakdown Level 1 or Higher)": "Chuẩn bị 12 Đồ ăn vặt. (Cấp độ Breakdown 1 trở lên)",
  "Complete All Research Projects. (Breakdown Level 1 or Higher)": "Hoàn thành mọi Dự án Nghiên cứu. (Cấp độ Breakdown 1 trở lên)",
  "Kill 50 Zombies with Revolvers. (Breakdown Level 3 or Higher)": "Giết 50 thây ma bằng Súng lục ổ quay. (Cấp độ Breakdown 3 trở lên)",
  "Kill 50 Zombies with Explosives. (Breakdown Level 4 or Higher)": "Giết 50 thây ma bằng Chất nổ. (Cấp độ Breakdown 4 trở lên)",
  "Killed 5 Bloaters at Breakdown Level 2 or Higher.": "Đã giết 5 Bloater ở cấp độ Breakdown 2 trở lên.",
  "Kill 5 Bloaters (Breakdown Level 2 or Higher).": "Giết 5 Bloater (Cấp độ Breakdown 2 trở lên).",
  "Kill 5 Bloaters. (Breakdown Level 2 or Higher)": "Giết 5 Bloater. (Cấp độ Breakdown 2 trở lên)",
  "Performed 50 Zombie Executions at Breakdown Level 3 or Higher.": "Đã thực hiện 50 Pha hành quyết thây ma ở cấp độ Breakdown 3 trở lên.",
  "Perform 50 Zombie Executions. (Breakdown Level 3 or Higher)": "Thực hiện 50 Pha hành quyết thây ma. (Cấp độ Breakdown 3 trở lên)",
  "Perform 50 Zombie Executions (Breakdown Level 3 or Higher).": "Thực hiện 50 Pha hành quyết thây ma (Cấp độ Breakdown 3 trở lên).",
  "Kill 100 Zombies with Blunt Weapons. (Breakdown Level 1 or Higher)": "Giết 100 thây ma bằng Vũ khí cùn. (Cấp độ Breakdown 1 trở lên)",
  "Earn 25 Headshot Streaks. (5 Headshots in a Row - Breakdown Level 4 or Higher)": "Đạt chuỗi 25 Phát bắn Headshot. (5 phát Headshot liên tiếp - Cấp độ Breakdown 4 trở lên)",
  "Scavenge 150 Resources. (Breakdown Level 4 or Higher)": "Thu lượm 150 Tài nguyên. (Cấp độ Breakdown 4 trở lên)",
  "Cook a Delicious Feast. (Breakdown Level 2 or Higher)": "Nấu một Bữa tiệc thịnh soạn. (Cấp độ Breakdown 2 trở lên)",
  "Kill 100 Zombies with Blades. (Breakdown Level 2 or Higher)": "Giết 100 thây ma bằng Vũ khí sắc bén. (Cấp độ Breakdown 2 trở lên)",
  "Kill 5 Juggernauts. (Breakdown Level 5 or Higher)": "Giết 5 Juggernaut. (Cấp độ Breakdown 5 trở lên)",
  "Kill 50 Zombies with automatic Pistols. (Breakdown Level 1 or Higher)": "Giết 50 thây ma bằng Súng lục tự động. (Cấp độ Breakdown 1 trở lên)",
  "Create Weapons in the Workshop 5 Times. (Breakdown Level 3 or Higher)": "Chế tạo Vũ khí trong Xưởng 5 lần. (Cấp độ Breakdown 3 trở lên)",
  "Max Out Every Type of Facility. (Breakdown Level 1 or Higher)": "Nâng cấp Tối đa Mọi loại Cơ sở vật chất. (Cấp độ Breakdown 1 trở lên)",
  "Collect 150 Resources (Breakdown Level 4 or Higher).": "Thu thập 150 Tài nguyên (Cấp độ Breakdown 4 trở lên).",
  "Kill 100 Zombies with a Car Door. (Breakdown Level 1 or Higher)": "Giết 100 thây ma bằng Cửa xe ô tô. (Cấp độ Breakdown 1 trở lên)",
  "Craft 300 Rounds of Ammo. (Breakdown Level 3 or Higher)": "Chế tạo 300 Viên đạn. (Cấp độ Breakdown 3 trở lên)",
  "Get Torn Apart by Zombies. (Breakdown Level 1 or Higher)": "Bị xé xác bởi Thây ma. (Cấp độ Breakdown 1 trở lên)",
  "Kill 50 Zombies with Rifles. (Breakdown Level 2 or Higher)": "Giết 50 thây ma bằng Súng trường. (Cấp độ Breakdown 2 trở lên)",
  "Create Medication in the Infirmary 5 Times. (Breakdown Level 3 or Higher)": "Chế tạo Thuốc men trong Bệnh xá 5 lần. (Cấp độ Breakdown 3 trở lên)",
  "Kill 50 Zombies with Shotguns. (Breakdown Level 5 or Higher)": "Giết 50 thây ma bằng Súng Shotgun. (Cấp độ Breakdown 5 trở lên)"
};

let translatedCount = 0;

for (const file of files) {
  const filePath = path.join(DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;

  data.replacements.forEach(r => {
    if (dictionary[r.sourceText]) {
      r.translatedText = dictionary[r.sourceText];
      changed = true;
      translatedCount++;
    } else if (r.sourceText.includes('(Breakdown Level') || r.sourceText.includes('Breakdown Level')) {
      console.log('Missed:', r.sourceText);
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }
}

console.log(`Translated ${translatedCount} strings.`);
