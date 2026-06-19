import fs from "node:fs";
import { replaceXmlStrings } from "../tools/lib/strings.js";

const translations = new Map([
  // Job 1
  ["Shotgun Shells", "Đạn Shotgun"],
  ["For shotguns.", "Dùng cho súng shotgun."],
  ["Incendiary Shotgun Shells", "Đạn Shotgun Cháy"],
  ["Incendiary ammo for compatible shotguns.", "Đạn cháy cho súng shotgun tương thích."],
  ["Grenade Launcher Ammo", "Đạn Súng Phóng Lựu"],
  ["For grenade launchers. Obviously.", "Dùng cho súng phóng lựu. Rõ ràng rồi."],
  ["9 mm", "Đạn 9mm"],
  ["Small-caliber rounds for pistols, revolvers and rifles.", "Đạn cỡ nhỏ cho súng lục, súng côn và súng trường."],
  [".22 caliber", "Đạn cỡ .22"],
  ["Small-caliber rounds for pistols, revolvers, rifles, and SMGs.", "Đạn cỡ nhỏ cho súng lục, súng côn, súng trường và tiểu liên."],
  [".357 caliber", "Đạn cỡ .357"],
  ["Powerful round for revolvers and some rifles.", "Đạn uy lực mạnh cho súng côn và một vài loại súng trường."],
  [".40 caliber", "Đạn cỡ .40"],
  ["Mid-range round for pistols and some submachineguns.", "Đạn tầm trung cho súng lục và vài loại súng tiểu liên."],
  [".44 caliber", "Đạn cỡ .44"],
  ["Powerful round primarily for revolvers and some rifles.", "Đạn uy lực mạnh chủ yếu cho súng côn và một vài loại súng trường."],
  [".45 caliber", "Đạn cỡ .45"],
  ["Powerful mid-range workhorse for pistols, some revolvers and rifles.", "Đạn tầm trung mạnh mẽ đa dụng cho súng lục, vài loại súng côn và súng trường."],
  [".50 caliber", "Đạn cỡ .50"],
  ["Very powerful round for large frame revolvers, pistols and long range rifles.", "Đạn cực mạnh cho các loại súng côn cỡ lớn, súng lục và súng trường bắn tỉa."],
  ["Standard NATO battle rifle caliber, includes the .223 caliber family of rounds as well.", "Đạn súng trường chiến đấu chuẩn NATO, bao gồm cả dòng đạn cỡ .223."],
  ["Powerful round used the world over. Includes the entirety of the thirty-caliber family of rifle ammunition. Used by battle rifles and long-range rifles.", "Loại đạn uy lực được sử dụng trên toàn thế giới. Bao gồm toàn bộ đạn súng trường cỡ .30. Dùng cho súng trường chiến đấu và bắn tỉa."],
  ["Small Backpack", "Ba Lô Nhỏ"],
  ["Traveling light is good, but having what you need is better.", "Đi lại nhẹ nhàng thì tốt, nhưng mang đủ đồ dùng cần thiết vẫn tốt hơn."],
  ["Medium Pack", "Ba Lô Vừa"],
  ["Large Backpack", "Ba Lô Lớn"],
  ["More carrying capacity, but it's bulky.", "Chứa được nhiều đồ hơn, nhưng khá cồng kềnh."],
  ["Large Pack", "Ba Lô Lớn"],
  ["Low Backpack", "Ba Lô Dạng Thấp"],
  ["A low-slung bag for the efficient packer.", "Loại túi đeo thấp dành cho người biết cách sắp xếp đồ đạc."],

  // Job 2
  ["School Backpack", "Cặp Học Sinh"],
  ["You can't start off a new school year without a sweet-ass new backpack!", "Bạn không thể bắt đầu năm học mới mà thiếu một chiếc cặp mới cực ngầu!"],
  ["School Pack", "Cặp Học Sinh"],
  ["Numbs the pain, but won't help serious wounds.", "Làm giảm đau, nhưng không có tác dụng với vết thương nặng."],
  ["Numbs the pain, but won't help serious wounds. Typical over-the-counter stuff.", "Làm giảm đau, nhưng không có tác dụng với vết thương nặng. Loại thuốc phổ thông ngoài tiệm."],
  ["Numbs the pain, but won't help serious wounds. Typical over-the-counter stuff. Come on, everybody knows what aspirin is.", "Làm giảm đau, nhưng không có tác dụng với vết thương nặng. Thôi nào, ai chả biết aspirin là gì."],
  ["Numbs the pain, but won't help serious wounds. Typical over-the-counter stuff. I like the ones with the sugary coating.", "Làm giảm đau, nhưng không có tác dụng với vết thương nặng. Tôi thích mấy loại được bọc đường bên ngoài."],
  ["Numbs the pain, but won't help serious wounds. Serious stuff. Feels pretty damn good, though.", "Làm giảm đau, nhưng không có tác dụng với vết thương nặng. Thuốc mạnh đấy. Dù sao thì uống vào cảm giác khá tuyệt."],
  ["Numbs the pain, but won't help serious wounds. Typical over-the-counter stuff. Tastes like ass, but knocks out just about anything.", "Làm giảm đau, nhưng không tác dụng với vết thương nặng. Loại phổ thông. Vị tởm lợm, nhưng trị được hầu hết mọi cơn đau."],
  ["Numbs the pain, but won't help serious wounds. Serious stuff. Also good for getting off the junk.", "Làm giảm đau, nhưng không có tác dụng với vết thương nặng. Thuốc mạnh. Cũng rất tốt để cai nghiện."],
  ["Serious stuff. Numbs the pain, but won't help serious wounds. It'll just make you not care about them.", "Thuốc cực mạnh. Làm giảm đau nhưng không có tác dụng với vết thương nặng. Nó chỉ làm bạn đếch quan tâm đến cái đau nữa."],
  ["Improvised Painkiller", "Thuốc Giảm Đau Tự Chế"],
  ["Good stuff. Numbs the pain, but won't help serious wounds.", "Thuốc tốt đấy. Làm giảm đau, nhưng không có tác dụng với vết thương nặng."],
  ["Eat for a temporary stamina boost.", "Ăn để tăng tạm thời thể lực."],
  ["So good...", "Ngon quá..."],
  ["Restores max stamina a little. It's cold, it's stale, and I think it was filtered with zombie guts, but dammit, it's coffee.", "Hồi phục một chút thể lực tối đa. Nó lạnh ngắt, ôi thiu, và tôi nghĩ nó được lọc qua ruột zombie, nhưng mẹ kiếp, có cà phê là ngon rồi."],
  ["Energy Drink", "Nước Tăng Lực"],
  ["Mmmm, guarana.  (Removes penalties to your maximum stamina)", "Ưmmm, vị trái guarana. (Xóa bỏ các hình phạt bị giảm thể lực tối đa)"],
  ["Mild Stims", "Thuốc Kích Thích Nhẹ"],
  ["Restores max Stamina a little. Fresh from our med lab. Heisenberg would be proud.", "Hồi phục một chút thể lực tối đa. Mới ra lò từ phòng y tế. Heisenberg chắc hẳn sẽ tự hào lắm."],
  ["Potent Stims", "Thuốc Kích Thích Mạnh"],
  ["Restores max Stamina a lot. Fresh from our lab, cooked up extra potent. (Addictive?) ", "Hồi phục rất nhiều thể lực tối đa. Mới ra lò từ phòng thí nghiệm, được pha chế thêm độ mạnh. (Gây nghiện?) "],
  ["Restores max stamina a fair bit. (Addictive?) Pure glass--the good stuff. Accept no substitute.", "Hồi phục khá nhiều thể lực tối đa. (Gây nghiện?) Trong suốt như pha lê -- hàng tuyển đấy. Không gì thay thế được."],
  ["Trucker Pills", "Thuốc Của Tài Xế Tải"],
  ["Restores max stamina a fair bit. (Addictive?) King of the Road Trucking Pills. Truck as hard as you want. The label says fenethyl-something, only approved in Europe.", "Hồi phục khá nhiều thể lực. (Gây nghiện?) Thuốc Vua Đường Trường. Lái xe bao lâu tùy thích. Nhãn hiệu ghi fenethyl-gì đó, chỉ được cấp phép ở Châu Âu."],
  ["Restores max stamina a fair bit. (Addictive?) Active ingredient: modafinil. Whatever that is.", "Hồi phục khá nhiều thể lực tối đa. (Gây nghiện?) Thành phần hoạt tính: modafinil. Cho dù nó là cái quái gì đi nữa."],
  ["Sets zeds on fire. This one's just a rag stuffed into a bottle of booze. Top shelf too.", "Thiêu rụi bọn xác sống. Cái này chỉ là một miếng giẻ nhét vào chai rượu chivas. Hàng loại xịn luôn."],
  ["Petrol Bomb", "Bom Xăng"],
  ["Sets zeds on fire. They don't seem to like it much. This one's made with gasoline.", "Thiêu rụi bọn xác sống. Bọn chúng có vẻ không thích cái này cho lắm. Món này được làm từ xăng."],
  ["Wilkerson Private Reserve", "Rượu Tự Nấu Nhà Wilkerson"],

  // Job 3
  ["Light em' up! Redneck's special blend. Pretty sure it's pure wood-grain alcohol.", "Đốt cháy bọn chúng! Thức uống pha trộn đặc biệt của mấy tay nông dân. Khá chắc đây là cồn metanol nguyên chất."],
  ["Zeds dislike fire. This one comes fresh out of our workshop, so go us!", "Xác sống ghét lửa. Quả này vừa ra lò từ xưởng của chúng ta, tiến lên nào!"],
  ["Chemical Incendiary", "Lựu Đạn Cháy Hóa Học"],
  ["Sets zeds on fire. They don't seem to like it much. Watch it with this one--it's got a kick.", "Thiêu rụi bọn xác sống. Bọn chúng có vẻ không thích cái này cho lắm. Cẩn thận với quả này -- nó nổ mạnh lắm."],
  ["The AN-M14 TH3 chemical incendiary. Pretty sure this one could melt through a truck engine.", "Lựu đạn cháy hóa học AN-M14 TH3. Chắc chắn quả này có thể nung chảy cả động cơ xe tải."],
  ["Frag Grenade", "Lựu Đạn Mảnh"],
  ["Pull pin, toss, wait for boom. Repeat as necessary.", "Rút chốt, ném, chờ nổ. Lặp lại nếu cần thiết."],
  ["Improvised Explosive", "Thuốc Nổ Tự Chế"],
  ["You throw it. It goes boom. If you're lucky, not right in your face.", "Bạn ném nó. Nó nổ cái bùm. Nếu bạn may mắn, nó sẽ không nổ ngay vào mặt bạn."],
  ["M67 Grenade", "Lựu Đạn M67"],
  ["Standard military hand grenade. This one fell off a truck, a big green truck.", "Lựu đạn tiêu chuẩn của quân đội. Quả này rơi ra từ một chiếc xe tải, một chiếc xe tải màu xanh lá cây to bự."],
  ["Mk2 Grenade", "Lựu Đạn Mk2"],
  ["The old pineapple grenade, I'm sure it's still ok after sitting around for 65 years.", "Loại lựu đạn quả dứa đời cũ, tôi cá là nó vẫn hoạt động tốt sau 65 năm vứt lay lắt."],
  ["Pipe Bomb", "Bom Ống"],
  ["It's a bunch of explosives stuffed into a pipe. What could go wrong?", "Chỉ là một đống thuốc nổ nhét vào một cái ống sắt. Có thể tệ đến mức nào chứ?"],
  ["Steel Pipe Bomb", "Bom Ống Thép"],
  ["It's a WHOLE bunch of explosives stuffed into a pipe. Extra shrapnel means more dead zombies.", "Một CỤC TO thuốc nổ nhét vào trong ống sắt. Nhiều mảnh văng hơn đồng nghĩa với nhiều xác sống chết hơn."],
  ["Lights an area up. Good for night-time zombie spotting, or night-time zombie luring.", "Thắp sáng một khu vực. Thích hợp để phát hiện xác sống vào ban đêm, hoặc thu hút bọn chúng."],
  ["Box Mine", "Mìn Hộp"],
  ["So what if it's a bunch of nuts and bolts in an old paint can? It still explodes.", "Thì sao nếu nó chỉ là một đống ốc vít nhét trong lon sơn cũ? Nó vẫn nổ được mà."],
  ["Flame Fougasse", "Mìn Phun Lửa"],
  ["Like a Molotov, but this one's pressure sensitive.", "Giống như bom xăng Molotov, nhưng quả này kích nổ bằng áp suất chèn ép."],
  ["Whistling Box Mine", "Mìn Hộp Phát Ra Tiếng Hú"],
  ["Cram a noisemaker into an improvised mine, and it lures the zombies in before it explodes. Nice.", "Nhét thiết bị phát tiếng ồn vào quả mìn tự chế, nó sẽ thu hút bọn xác sống trước khi phát nổ. Rất tuyệt."],
  ["Pops up to head height for optimal zombie killing.", "Nảy lên ngang tầm đầu để mang lại hiệu quả tiêu diệt zombie tối đa."],
  ["Stockpiled since 1974, this example came out of an EOD training container.", "Được lưu kho từ năm 1974, mẫu này được lấy ra từ một container huấn luyện tháo gỡ bom mìn (EOD)."],
  ["Artillery Marker", "Điểm Chỉ Thị Pháo Kích"],
  ["Toss this to target an area for artillery.", "Ném cái này để đánh dấu tọa độ cho pháo kích."],
  ["Sudden noises are great for grabbing attention. (Best to toss these and then run or hide.)", "Những tiếng ồn bất ngờ rất hữu ích để thu hút sự chú ý. (Tốt nhất là ném chúng rồi bỏ chạy hoặc ẩn nấp.)"],
  ["Wind-Up Alarm Clock", "Đồng Hồ Báo Thức Lên Dây Cót"]
]);

const OUTPUT_FILE = "output/gamedata/libs/class3/items/items.xml";
const INPUT_FILE = "input/gamedata/libs/class3/items/items.xml";

if (!fs.existsSync("output/gamedata/libs/class3/items")) {
  fs.mkdirSync("output/gamedata/libs/class3/items", { recursive: true });
}

const sourceXml = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, "utf8") : fs.readFileSync(INPUT_FILE, "utf8");
const translatedXml = replaceXmlStrings(sourceXml, translations);

fs.writeFileSync(OUTPUT_FILE, translatedXml);
console.log(`Translated 90 strings in ${OUTPUT_FILE}`);
