import fs from "node:fs";
import { replaceXmlStrings } from "../tools/lib/strings.js";

const translatedStrings = [
  // Job 4
  "Bút bi xanh viết trên mặt sau đơn đặt hàng kho của Tartan Mart.",
  "Tôi để lại tờ giấy này cho gia đình và bạn bè. Nếu bạn không phải là họ, hãy bỏ nó xuống trước khi chất độc trong mực thấm vào da và giết chết bạn. Nếu đúng là mọi người, đừng lo, vụ chất độc chỉ là lừa thôi. Tôi sẽ qua sông để tìm hiểu xem lũ quân đội khốn khiếp đó biết gì. Nếu tôi không về vào thứ Năm, cứ coi như tôi đã bị tia la-de kiểm soát tâm trí của chính phủ khống chế và mọi người nên bắn tôi ngay khi thấy mặt.",
  "Bút dạ đen viết trên nắp hộp các tông.",
  "Mẩu giấy này dành cho John. Và cho Sara. Cho cả Lisa, Geraldo, Mahz và tất cả mọi người. Tôi là người duy nhất còn sống sót. Xin lỗi mọi người, đây là đài tưởng niệm tốt nhất tôi có thể làm. Tôi sẽ để lại tờ giấy này ở nơi hy vọng ai đó sẽ tìm thấy. Kèm theo vài bức ảnh từ chuyến đi Vegas cuối tuần năm ngoái. Mong là nó sẽ đến được tay người thân của mọi người. Yêu tất cả các bạn.",
  "Bút bi xanh viết trên giấy viết thư hoa màu hồng, được bọc kín trong túi nilon.",
  "Anthony thân mến, nhà mình đã đợi lâu nhất có thể rồi. Bố con không muốn ở lại thêm nữa. Mẹ đoán là ông ấy đúng. Chúng ta không thể đánh cược mạng sống của những người khác. Mẹ mong con tìm thấy tờ giấy này và sẽ đi tìm cả nhà. Mọi người không hề muốn rời đi mà thiếu con. Yêu con. Hãy bảo trọng nhé.",
  "Bút đỏ viết trên một phong bì có chữ \"Anthony\" ở mặt trước.",
  "Carly, nếu em đọc được mảnh giấy này, HÃY Ở LẠI ĐÂY. Anh nghe đồn em đang ở Danforth nên đã đến đó kiểm tra, nhưng phòng khi tin đồn sai, anh muốn em đợi anh ở đây. Khóa chặt cửa, trong nhà có thức ăn và đạn dược, và đừng cho ai vào ngoại trừ anh. Rõ chưa? Anh sẽ gặp em sớm thôi.",
  "Bút đen viết trên giấy nhớ màu vàng.",
  "Gửi Colin, tôi bỏ anh đây. Tôi không thể chịu đựng nổi những lời dối trá, sự hoang tưởng, hay những điệp khúc lải nhải liên tục về thuyết âm mưu của chính phủ nữa. Tôi sẽ về ở với mẹ trên miền bắc. Đừng tìm tôi làm gì. - Elsa. Tái bút: Tôi đã lấy hết súng, đạn và mấy khẩu phần ăn MRE lố bịch của anh rồi ném hết xuống sông. Đáng đời anh lắm, đồ con lợn.",
  "Bút xanh viết trên tờ giấy nhớ nhàu nát.",
  "Nhật ký thân mến, VÃI CỨT NÓ CÓ TÁC DỤNG THẬT! Khi Skyler bảo nó tìm thấy một nghi lễ có thể thao túng kẻ chết theo ý đồ đen tối của bọn này và cuối cùng cũng có thể trả thù mấy thằng khốn như Ricky Valdez, tôi đã tưởng nó bốc phét, nhưng NÓ HIỆU NGHIỆM THẬT! Tin tức đưa ầm ầm, người chết đang đội mồ sống dậy để ăn thịt người sống! Quay lại ngay, đi thử siêu năng lực điều khiển zombie đây!",

  // Job 5
  "Bút bi đỏ viết trong một cuốn nhật ký nhỏ bọc da.",
  "Gửi thằng khốn nào mò vào đây để hôi của nhà tao: một lon thức ăn trong bếp đã bị tẩm độc. Chúc may mắn nhé, thằng ngu.",
  "Bút dạ đỏ viết trên giấy vẽ, chữ rất to.",
  "Dự án: PALLAS Giai đoạn 1 hoàn tất. Đánh giá: Vượt xa các thông số dự kiến. Giai đoạn 2 đang chờ thiết lập lại chuỗi chỉ huy thích hợp.",
  "Bút đen trên mẫu đơn quân sự 469, có nhãn \"Báo cáo Hạn chế Nhiệm vụ\". Ký tên Trung tá Schwalier.",
  "Nếu ông nghĩ chuyện này \"tự nhiên xảy ra\", thì ông đang tự lừa mình đấy. Ai đó biết rõ nguyên nhân, ai đó ĐỨNG SAU chuyện này. Không tin tôi à? Vậy thử giải thích đi: tại sao Quân đội lại bắt đầu sơ tán người dân hai ngày TRƯỚC khi có các cuộc tấn công chính thức đầu tiên?",
  "Đánh máy (đúng vậy, bằng máy đánh chữ thật) trên giấy in.",
  "Toàn tin tức kỳ lạ, và hôm nay Job Wilkerson gọi điện nói rằng tôi có thể trả nợ bằng đạn và thức ăn thay vì tiền mặt. Chuyện quái gì đang diễn ra thế này?",
  "Bút dạ xanh viết trên sổ tay trắng. Dư ra ba dấu chấm hỏi.",
  "Dì Helen: Cháu mất mười năm, nhưng cuối cùng cũng tìm ra nó. Bằng chứng cho thấy tay cảnh sát trưởng đã giấu nhẹm chứng cứ trong vụ án của em họ để hắn và lão thẩm phán khốn khiếp đó có thể giữ nguyên tỷ lệ kết án thành công. Đáng lẽ hôm nay cháu phải đưa nó cho bạn của Ủy viên hội đồng Santos ở tòa soạn Marshall Gazette, nhưng ông ta phải dời lịch. Nghe đâu vì có tin nóng tại bệnh viện.",
  "Bản in máy tính trên giấy tiêu đề cá nhân, được gửi đi hai tuần trước.",
  "Chủng 854b cho thấy khả năng kháng thuốc đáng kinh ngạc đối với các biện pháp kháng sinh truyền thống. Tỷ lệ xác suất ngăn chặn thành công: 13.48%",
  "Bút đen trên mẫu đơn CDC NORS (WDT) bị bôi đen kiểm duyệt chi chít.",
  "Tôi đã chờ khoảnh khắc này cả đời. Thanh katana đã sắc bén, khẩu .50 cal đã lên đạn đầy đủ, và chiếc áo măng tô vừa được giặt khô thơm phức. Đến lúc đi giết vài con zombie rồi.",
  "Bút sơn trắng viết trên giấy vẽ đen.",
  "BÉ GÁI MẤT TÍCH: Có ai thấy cháu không? Alex Collins, cao 1m67 nặng 51kg, mắt nâu, tóc nhuộm tím. CÓ HẬU TẢ, KHÔNG HỎI THÊM BẤT CỨ ĐIỀU GÌ. Chúng tôi chỉ muốn con gái bé bỏng của mình về nhà.",
  "Bản photo màu, kèm theo vài tấm ảnh.",
  "Harlan, anh có thể mua hộp sữa ở Tartan Mart vào lần ra ngoài tới không? Em muốn nướng bánh cho sinh nhật bé Lucy. Cảm ơn anh! - Sandy xoxoxo",
  "Bút xanh viết trên tờ giấy nhớ có dòng chữ \"Việc cần làm\".",
  "Chào Mẹ. Không hiểu sao con cứ liên tục viết mấy tờ giấy này cho mẹ -- con đã quá lớn để tin rằng mẹ đang đọc chúng trên Thiên đường. Chắc là do thói quen. Dù sao thì, Joanie đã sinh em bé, ca đẻ hơi vất vả. Cô ấy đang ở nhà ngoại ngoài phía tây một thời gian, nhưng con phải ở lại đây để tiếp tục làm việc. Thật khó khăn khi biết cô ấy và bé Max ở xa đến vậy, nhưng đó là điều mà những người đàn ông phải làm vì gia đình mình đúng không? Đó là những gì mẹ và bố đã dạy con mà. Thôi mẹ nhé, con phải đi đây -- TV vừa thông báo lệnh sơ tán khẩn cấp hay gì đó. Tốt nhất con nên đi xem có chuyện gì. Gửi tình yêu đến Ông Bà. - Eugene",
  "Bút bi xanh viết trong một cuốn sổ tay nhỏ, sờn cũ.",
  "Kate - Bố con vẫn chưa về từ trạm hậu cần ở khu kiểm lâm. Mẹ sẽ đi xem chuyện gì đã cản trở ông ấy. Nếu mẹ không về trước khi con thức dậy, hãy ở lại trong cabin và ăn tạm thanh yến mạch cho bữa sáng. Không được dùng bếp trại khi không có người lớn. - Mẹ",
  "Bút đen viết trên mặt sau vỏ hộp yến mạch.",
  "Điện thoại bị nứt màn hình và gần như cạn pin, nhưng chức năng máy ảnh hiển thị hàng loạt bức ảnh những bóng người lờ đờ đang tiến vào ánh sáng của lửa trại, trong khi vài đứa sinh viên đại học đang đứng nhìn. Bức ảnh cuối cùng chụp một trong những bóng người đó tóm lấy vai một chàng trai trẻ. Nhật ký cuộc gọi cho thấy có bảy cuộc gọi nhỡ đến số 911.",
  "Điện thoại hỏng, bị kẹt ở thư mục \"Ảnh của tôi\".",
  "Thấy một gã quái dị lảng vảng gần nhà vệ sinh công cộng. Trông gã như say xỉn. Hay là phê thuốc gì đó. Bốc mùi nữa. Tởm thật. Tớ quyết định nhịn đái luôn.",
  "Bút dạ bạc, viết chữ thảo, trên giấy nhật ký màu kem, chữ \"O\" trong từ tởm lợm có vẽ hình mặt cười bên trong.",
  "Kiểm lâm Gunderson - Rất tiếc, nhưng dù anh đã liên tục yêu cầu, chúng tôi không thể cấp phép mua súng săn cỡ nòng .50 cho trạm kiểm lâm. Chúng tôi muốn nhắc anh rằng hơn 40 năm qua chưa ai thấy gấu trên Núi Tanner, và hơn nữa, súng trường nòng lớn cũng không phải là phương pháp được khuyến nghị để đối phó với lũ gấu hoang.",
  "Bản in máy tính trên giấy tiêu đề chính thức của Sở Quản lý Công viên Quận.",
  "Điểm Chỉ Thị Pháo Cối",

  // Job 6
  "Ném cái này để đánh dấu mục tiêu pháo cối.",
  "Điểm Chỉ Thị Không Kích",
  "Ném cái này để gọi máy bay không người lái oanh tạc.",
  "Súng lục: G 17C",
  "Dòng súng \"G\" rất phổ biến. Khung polymer.",
  "Súng lục: Bz 75",
  "Được lực lượng cảnh sát trên toàn thế giới ưa chuộng.",
  "Súng lục: D 1911",
  "Vị vua của dòng đạn .45.",
  "Súng lục: G 19",
  "Nhỏ gọn, người em của khẩu G17C.",
  "Súng lục: G 26",
  "Cực kỳ nhỏ gọn và đanh đá, y như đứa em gái của bạn.",
  "Súng lục: M9",
  "Vũ khí tiêu chuẩn trong hầu hết các nhánh của Quân đội Hoa Kỳ từ năm 1985.",
  "Súng lục: P 226",
  "Độ chính xác chuẩn Châu Âu được cảnh sát và quân đội toàn thế giới tin dùng.",
  "Súng lục: 1911A1 Officer",
  "Vật phẩm sưu tầm mang tính lịch sử, vẫn còn hoạt động tốt.",
  "Súng lục: Condor",
  "Sử dụng đạn súng lục .50 AE, một vũ khí đè bẹp mọi đối thủ.",
  "Súng lục: G 20",
  "Được làm lại từ cỡ 10mm sang .45 cal. Kèm theo ống ngắm.",
  "Súng lục: G21",
  "Một siêu phẩm khác thuộc dòng \"G\", cỡ đạn .45.",
  "Súng lục: G22",
  "Được các đơn vị cảnh sát yêu thích, nhẹ và uy lực.",
  "Súng lục: M11",
  "Một biến thể P226 được vài đơn vị đặc nhiệm Hoa Kỳ sử dụng.",
  "Súng lục: Mi.Le"
];

const jobs = JSON.parse(fs.readFileSync("jobs/pending.json", "utf8"));
// Lấy các câu tiếng Anh từ Job 4, 5, 6 (index 3, 4, 5)
const englishStrings = [...jobs[3].strings, ...jobs[4].strings, ...jobs[5].strings];

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
