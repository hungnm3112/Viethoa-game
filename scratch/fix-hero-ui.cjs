const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'output/languages/chunks';

const dictionary = {
  "Choose Your Hero": "Chọn Anh Hùng",
  "Play Breakdown": "Chơi Breakdown",
  "Back": "Quay Lại",
  "Used to be a wild child in college, but confronting the outbreak has sparked a return to the faith of her youth. She meditates daily and commits herself to personal discipline and service to others.": "Từng là một cô nàng nổi loạn ở trường đại học, nhưng việc đối mặt với đại dịch đã thắp lại niềm tin vào tín ngưỡng thời tuổi trẻ của cô. Cô thiền định hàng ngày và cam kết rèn luyện kỷ luật bản thân cũng như phục vụ người khác.",
  "Wasn't as cut out for the military life as his brother. Took his demolitions training home to work in the coal mines ... and occasionally on bank vaults.": "Không phù hợp với cuộc sống quân ngũ như anh trai mình. Đã mang kỹ năng huấn luyện tháo dỡ thuốc nổ về nhà để làm việc trong các mỏ than... và đôi khi là trên các kho bạc.",
  "Skilled rider who shows horses at the county fair.": "Người cưỡi ngựa điêu luyện thường trình diễn ngựa tại hội chợ của quận.",
  "Long-time Marshall garbage man who hoards useful stuff that people throw away.": "Người dọn rác lâu năm ở Marshall, luôn tích trữ những thứ hữu ích mà người khác vứt đi.",
  "One of the Wilkersons' flunkies.": "Một trong những tên tay sai của nhà Wilkerson.",
  "Local charity worker and activist.": "Nhà hoạt động và nhân viên từ thiện địa phương.",
  "Can fix just about anything... as long as he's got a steady supply of whiskey.": "Có thể sửa chữa gần như mọi thứ... miễn là ông ta có đủ nguồn cung cấp rượu whiskey ổn định.",
  "Tasked with maintaining some semblance of order in Trumbull County.": "Được giao nhiệm vụ duy trì một chút trật tự nào đó ở Quận Trumbull.",
  "Local carpenter, one of the first to help organize survivors.": "Thợ mộc địa phương, một trong những người đầu tiên giúp tổ chức những người sống sót.",
  "The youngest Wilkerson brother is near death.": "Người em út nhà Wilkerson đang cận kề cái chết.",
  "The youngest Wilkerson brother. A reckless hoodlum.": "Người em út nhà Wilkerson. Một gã du côn liều lĩnh.",
  "The oldest Wilkerson brother. He's a psychopathic son of a bitch.": "Người anh cả nhà Wilkerson. Hắn là một tên khốn nạn tâm thần.",
  "The middle Wilkerson brother. A cold-blooded schemer.": "Người anh thứ nhà Wilkerson. Một kẻ mưu mô máu lạnh.",
  "Since the outbreak, Sgt. Tan and his squad have been tasked with maintaining some semblance of order in Trumbull County.": "Kể từ khi bùng phát đại dịch, Trung sĩ Tan và đội của anh đã được giao nhiệm vụ duy trì trật tự tại Quận Trumbull.",
  "Captain Montressor is a driven, fiercely competitive woman who demands nothing but the best from herself and those around her. Her subordinates privately call her the Monster for her mercilessly high standards. ": "Đại úy Montressor là một người phụ nữ năng nổ, cạnh tranh khốc liệt, người không đòi hỏi gì ngoài những điều tốt nhất từ bản thân và những người xung quanh. Cấp dưới lén gọi cô là Quái Vật vì những tiêu chuẩn cao đến mức tàn nhẫn.",
  "Since the zombie apocalypse, Judge Lawton has been the front-runner in maintaining some semblance of society amongst the survivors.": "Kể từ khi tận thế thây ma xảy ra, Thẩm phán Lawton đã trở thành người đi đầu trong việc duy trì một chút trật tự xã hội giữa những người sống sót.",
  "Former county commissioner. Slick bastard.": "Cựu ủy viên quận. Tên khốn dẻo miệng.",
  "Carl comes across as a quiet, patient, introspective sort. He's a long-time veteran of the force, and though he never rose above patrolman rank, he was always a dependable cop, and the department frequently partnered him up with rookies, trusting him to show them the ropes.": "Carl tỏ ra là một người ít nói, kiên nhẫn và sống nội tâm. Ông là một cựu chiến binh lâu năm của lực lượng, và mặc dù chưa bao giờ thăng chức quá cấp bậc tuần tra viên, ông luôn là một cảnh sát đáng tin cậy, và sở thường xuyên xếp ông làm đối tác với lính mới, tin tưởng giao cho ông việc chỉ bảo họ.",
  "Quentin's about as big-hearted and generous as they come. If it were up to him, he'd hand out all the food in the store to anybody who needed it; that's just what people do in a crisis, right?": "Quentin là một người vô cùng rộng lượng và hào phóng. Nếu được quyết định, anh ấy sẽ phân phát toàn bộ thức ăn trong cửa hàng cho bất cứ ai cần; đó là điều mọi người nên làm trong lúc khủng hoảng mà, phải không?",
  "As bad as the situation is, in a way Becca welcomes it. The end of the world is an opportunity to forget the past and move on, and she's ready to become a new person": "Mặc dù tình hình rất tồi tệ, nhưng theo một cách nào đó Becca lại chào đón nó. Tận thế là một cơ hội để quên đi quá khứ và tiến bước, và cô ấy đã sẵn sàng để trở thành một con người mới.",
  "A good kid, but a little flaky.": "Một đứa trẻ ngoan, nhưng hơi lập dị.",
  "Heads up the church in Spencer's Mill.": "Người đứng đầu nhà thờ ở Spencer's Mill.",
  "Local boy who moved off to the big city, but still comes back to visit every year.": "Cậu trai địa phương chuyển đến thành phố lớn, nhưng vẫn quay lại thăm quê mỗi năm.",
  "As far as Sam is concerned, Trumbull Valley and just about everyone in it can suck her dick.": "Theo như Sam quan tâm, Thung lũng Trumbull và gần như tất cả mọi người trong đó đều có thể mút cặc cô.",
  "Alan has been a forest ranger with the Department of Fish and Wildlife since he graduated from community college.": "Alan đã là một kiểm lâm viên của Sở Cá và Động vật hoang dã kể từ khi anh tốt nghiệp trường cao đẳng cộng đồng.",
  "Here in the valley for a hunting trip with some old Army buddies.": "Đến thung lũng này cho một chuyến đi săn cùng với vài người bạn cũ trong Quân đội."
};

let count = 0;
const files = fs.readdirSync(OUTPUT_DIR);

for (const file of files) {
  if (!file.endsWith('.json')) continue;
  const filePath = path.join(OUTPUT_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;

  data.replacements.forEach(r => {
    if (dictionary[r.sourceText]) {
      r.translatedText = dictionary[r.sourceText];
      changed = true;
      count++;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }
}

// Ensure "Back" is in the pilot manifest if it's there
const PILOT_FILE = 'config/btxt-expanded-pilot.json';
if (fs.existsSync(PILOT_FILE)) {
  const pilot = JSON.parse(fs.readFileSync(PILOT_FILE, 'utf8'));
  let changed = false;
  pilot.replacements.forEach(r => {
    if (dictionary[r.sourceText]) {
      r.translatedText = dictionary[r.sourceText];
      changed = true;
      count++;
    }
  });
  if (changed) {
    fs.writeFileSync(PILOT_FILE, JSON.stringify(pilot, null, 2) + '\n', 'utf8');
  }
}

console.log(`Updated ${count} strings with correct translations.`);
