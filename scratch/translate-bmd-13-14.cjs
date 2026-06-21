const fs = require('fs');

const map = {
  // Chunk 13
  "Character Bio": "Tiểu Sử Nhân Vật",
  "Just came to Trumbull Valley for a vacation.": "Chỉ đến Thung lũng Trumbull để nghỉ mát thôi.",
  "Short-order cook, infamous for his greasy fries and dried-up grilled cheese sandwiches.": "Một gã đầu bếp nấu đồ ăn nhanh, mang tiếng xấu vì món khoai tây chiên sũng dầu và bánh mì kẹp phô mai nướng khô quắt queo.",
  "Eccentric historian, best known for his collection of antique dictionaries.": "Một nhà sử học lập dị, được biết đến với bộ sưu tập từ điển cổ siêu bự.",
  "Chatty stylist that just got her cosmetology certificate from the local community college.": "Một cô thợ tạo mẫu tóc lắm mồm vừa lấy được chứng chỉ thẩm mỹ từ trường cao đẳng cộng đồng ở địa phương.",
  "Used to run the Tartan Mart in Spencer's Mill.": "Từng điều hành siêu thị Tartan Mart ở Spencer's Mill.",
  "Designed Marshall's most famous buildings.": "Đã thiết kế những tòa nhà nổi tiếng nhất của Marshall.",
  "Learned electrical work from her mom. Learned medical work from Uncle Sam.": "Học nghề điện từ mẹ. Học nghề y từ quân đội Mỹ.",
  "Cross country cyclist who made the mistake of pit-stopping in Marshall.": "Một tay đua xe đạp đường trường đã mắc sai lầm lớn khi dừng chân tại Marshall.",
  "A meathead who's more concerned about the lack of football than he is about the zombies.": "Một thằng não cơ bắp quan tâm đến việc méo có bóng bầu dục để xem hơn là lo về lũ xác sống.",
  "Still can't wrap her head around what's going on.": "Vẫn chưa thể load nổi chuyện quái gì đang xảy ra.",
  "Specializes in Mexican/Indian fusion cuisine.": "Chuyên gia về ẩm thực kết hợp giữa Mexico và Ấn Độ.",
  "Efficient and thorough with little patience for bullshit.": "Làm việc hiệu quả, kỹ lưỡng và méo có kiên nhẫn cho mấy trò xạo lồn.",
  "Direct descendant of Ezekiel Marshall himself.": "Hậu duệ trực hệ của chính Ezekiel Marshall.",
  "Her parents hated her boyfriend... until the zombies got them.": "Bố mẹ cô ấy rất ghét bạn trai của cô... cho đến khi bị lũ xác sống xé xác.",
  "Has worked at the local drugstore for 30 years.": "Đã làm việc tại hiệu thuốc địa phương suốt 30 năm ròng.",
  "Has a little land just west of Spencer's Mill.": "Có một mảnh đất nhỏ nằm ngay phía tây Spencer's Mill.",
  "Always wanted to quit her job, but definitely not like this.": "Luôn muốn nghỉ việc, nhưng tuyệt đối không phải theo cái cách chó đẻ này.",
  "Always thinks he can do it better than you.": "Luôn ảo tưởng rằng hắn có thể làm mọi việc tốt hơn bạn.",
  "Was in her senior year of college.": "Đang là sinh viên năm cuối đại học.",
  "Marshall's resident stoner.": "Thằng nghiện hút cần chính hiệu của Marshall.",
  "A wealthy museum curator from Danforth.": "Một người quản lý bảo tàng giàu sụ đến từ Danforth.",
  "Makes a mean stroganoff.": "Nấu món bò hầm stroganoff ngon nhức nách.",
  "Ran the church bake sale every year for 20 years.": "Đã điều hành hội chợ bán bánh nướng của nhà thờ mỗi năm suốt 20 năm qua.",
  "Life was going pretty well until this happened.": "Cuộc sống đang trôi qua khá êm đềm cho đến khi đống rác rưởi này ập tới.",
  "A lawyer from the city who happened to be in Marshall when shit went down.": "Một gã luật sư từ thành phố tình cờ lọt hố ở Marshall đúng lúc mọi chuyện nát bét.",
  "Owner, sole waitress, and part-time cook at the Fork In the Road Diner.": "Bà chủ, nữ bồi bàn duy nhất và cũng là đầu bếp bán thời gian tại quán ăn Fork In the Road Diner.",
  "Grew up in a rough-and-tumble part of Chicago, but he'll be damned if he'll let that stand in his way.": "Lớn lên ở khu ổ chuột đầy bất ổn của Chicago, nhưng hắn thề sẽ không để điều đó cản bước mình.",
  "Comic book nerd who insists on being called \"Lex.\" No one listens.": "Thằng mọt truyện tranh cứ khăng khăng đòi người ta gọi mình là \"Lex\". Cơ mà méo ai quan tâm.",
  "Mild-mannered treasurer for the town of Marshall.": "Một gã thủ quỹ thị trấn Marshall với tính cách hiền lành, nhu mì.",
  "Classically trained ballet dancer from Danforth. Dancing is his life.": "Vũ công múa ballet được đào tạo bài bản từ Danforth. Nhảy múa là lẽ sống của anh ta.",
  "Obsessed with anything sports related.": "Bị ám ảnh với mọi thứ liên quan đến thể thao.",
  "Will never ask \"you want fries with that?\" again.": "Sẽ không bao giờ phải hỏi câu \"Quý khách có muốn dùng thêm khoai tây chiên không?\" một lần nào nữa.",
  "Amateur photographer who sells the occasional shot to small magazines.": "Một nhiếp ảnh gia nghiệp dư thỉnh thoảng bán được vài bức ảnh cho các tạp chí nhỏ.",
  "Famous for his sausage.": "Khét tiếng vì cây xúc xích của anh ấy.",
  "He's a whiz with a gun, and the dozens of taxidermied animals on his wall prove it.": "Anh ấy là một tay thiện xạ, và hàng tá những con thú nhồi bông treo trên tường đã chứng minh điều đó.",
  "Local high school English teacher.": "Giáo viên tiếng Anh của trường trung học địa phương.",
  "In charge of demolitions at the local construction company.": "Chịu trách nhiệm phá dỡ tại công ty xây dựng địa phương.",
  "Never did ask out that girl from the car dealership.": "Chưa bao giờ dám ngỏ lời hẹn hò với cô gái ở đại lý bán xe hơi đó.",
  "Her first emergency call resulted in her entire team's death.": "Cuộc gọi khẩn cấp đầu tiên trong đời đã dẫn đến cái chết của toàn bộ đội cô ấy.",
  "One of the first responders to the Marshall food riots.": "Một trong những người đầu tiên đối phó với cuộc bạo loạn tranh giành thức ăn ở Marshall.",
  "Bike messengers don't get a lot of work in small towns.": "Nghề giao hàng bằng xe đạp thường méo kiếm được mấy đồng ở mấy cái thị trấn nhỏ.",
  "Used to train race horses.": "Từng làm nghề huấn luyện ngựa đua.",
  "Everybody in town called her \"Crazy Marley.\"": "Mọi người trong thị trấn đều gọi cô ấy là \"Con Điên Marley\".",
  "Has a head full of useless knowledge.": "Sở hữu một cái đầu chứa đầy mớ kiến thức vô dụng.",
  "Loves the great outdoors.": "Cực kỳ yêu thích các hoạt động ngoài trời.",
  "Built his house with his own two hands.": "Tự tay dựng nên ngôi nhà của mình bằng chính hai bàn tay này.",
  "Took karate to get revenge on everybody who made fun of him in high school.": "Đã đi học võ karate chỉ để trả thù tất cả những đứa từng chế nhạo cậu ta ở trường trung học.",
  "Once punched a bear in the face. So he says.": "Từng đấm thẳng vào mặt một con gấu. Lão ấy tự chém gió thế.",
  "Insists that if you can kill it, you can fry it, and if you can fry it, you can eat it.": "Khăng khăng rằng nếu mày có thể giết nó, mày có thể rán nó, và nếu mày rán được thì mày có thể xơi nó.",

  // Chunk 14
  "A wild and crazy guy.": "Một gã hoang dại và điên rồ.",
  "A problem solver.": "Một chuyên gia giải quyết rắc rối.",
  "Surprised he hasn't French-kissed a shotgun yet.": "Ngạc nhiên là hắn vẫn chưa mút nòng khẩu shotgun nào để tự sát.",
  "Drove a big rig on the Danforth/Chicago route.": "Từng lái xe đầu kéo hạng nặng chạy tuyến Danforth/Chicago.",
  "Has been preparing for this her whole life. On her Xbox.": "Đã chuẩn bị cho ngày tàn thế này cả cuộc đời. Trên cái máy Xbox của cô ấy.",
  "Thinks this whole thing is kind of fascinating, if you think about it.": "Cho rằng toàn bộ đống rác rưởi này khá là thú vị, nếu bạn dành thời gian suy ngẫm về nó.",
  "Why does he call everybody \"Boss?\"": "Tại sao hắn lại gọi tất cả mọi người là \"Sếp\" thế nhỉ?",
  "Damn good shot.": "Bắn đạn chuẩn vãi lồn.",
  "Thinks he's God's gift to everybody.": "Cứ tưởng mình là món quà Chúa ban tặng cho nhân loại chắc.",
  "Whatever you do, don't tell him wrestling is staged.": "Làm gì thì làm, đừng có bảo hắn đấu vật biểu diễn chỉ là diễn kịch.",
  "Left the family farm to pursue a (hopeless) music career.": "Bỏ lại trang trại gia đình để theo đuổi một sự nghiệp âm nhạc (tuyệt vọng).",
  "Could snap at any time.": "Có thể hóa điên bất cứ lúc nào.",
  "Honorably discharged for a bum knee.": "Giải ngũ danh dự do chấn thương đầu gối.",
  "Was working on an article about the death of small-town America.": "Từng viết một bài báo về cái chết của những vùng quê nhỏ nước Mỹ.",
  "Thinks he's hard.": "Nghĩ mình là giang hồ thứ thiệt.",
  "Hates this town and everyone in it. Posers.": "Căm ghét cái thị trấn này và mọi kẻ sống trong đó. Lũ làm màu.",
  "A real cheery dearie.": "Một người thực sự vui vẻ, đáng yêu.",
  "Mistakenly thought the World Stroganoff Cookoff was in town.": "Tưởng nhầm Cuộc thi Nấu bò Stroganoff Thế giới được tổ chức ở thị trấn này.",
  "Once built a steam-powered corn husker.": "Từng chế tạo ra một cái máy tuốt ngô chạy bằng hơi nước.",
  "If it doesn't come in the form of a folksy saying, Janet doesn't trust it.": "Nếu nó không được phát ngôn dưới dạng một câu ca dao tục ngữ mộc mạc, Janet sẽ méo tin đâu.",
  "Had one guest star role on that sitcom with the talking dog 15 years ago.": "Từng đóng một vai khách mời trong cái bộ phim sitcom có con chó biết nói 15 năm trước.",
  "Cries for days if she stubs her toe.": "Chỉ cần vấp ngón chân một cái là cô ấy sẽ khóc lóc suốt mấy ngày trời.",
  "Dreamed of playing major league ball. Too bad he sucks at it.": "Từng mơ ước được chơi bóng chày giải nhà nghề. Tiếc là anh ấy đánh quá tệ.",
  "Everybody signed her yearbook \"Have a great summer.\"": "Ai cũng chỉ viết vào cuốn kỷ yếu của cô ấy dòng chữ \"Chúc một mùa hè tuyệt vời.\"",
  "Always manages to get in over his head.": "Luôn tìm cách tự rước họa vào thân.",
  "Can't think of one distinctive thing about this guy.": "Chẳng thể nghĩ ra được một điểm nổi bật nào về gã này.",
  "Don't let her get started.": "Tốt nhất đừng để cô ấy nổi cơn tam bành.",
  "Don't mention clowns around him.": "Tuyệt đối đừng nhắc đến bọn hề khi có mặt hắn.",
  "Thinks he's cursed.": "Nghĩ rằng bản thân đang bị nguyền rủa.",
  "Makes the best chicken soup in the valley.": "Nấu món súp gà ngon bá cháy nhất thung lũng.",
  "Good in a tight spot, but freaks out if he can't get a drink.": "Khá hữu dụng khi ngặt nghèo, nhưng sẽ hóa điên nếu méo có rượu để nốc.",
  "Builds houses for the poor.": "Thường xây nhà cho những người nghèo.",
  "Smartest guy I know.": "Thằng khôn nhất mà tôi từng biết.",
  "Not as racist as he seems.": "Thực ra không đến nỗi phân biệt chủng tộc như cái vẻ bề ngoài của lão đâu.",
  "If he offers to show you a trick, say no.": "Nếu hắn ngỏ ý muốn cho mày xem một trò ảo thuật, hãy từ chối ngay lập tức.",
  "Claims he saw Bigfoot once.": "Lão khẳng định rằng mình từng nhìn thấy Bigfoot.",
  "Restores classic cars.": "Chuyên phục chế những chiếc xe cổ.",
  "Runs a conspiracy theory blog.": "Sở hữu một trang blog chuyên về thuyết âm mưu.",
  "Grows soybeans and corn.": "Chuyên trồng đậu nành và ngô.",
  "Inherited lots of land, but his love of bourbon bankrupted him...and makes sure he stays that way.": "Thừa kế rất nhiều đất đai, nhưng tình yêu mãnh liệt với rượu bourbon đã làm lão phá sản... và khiến lão muôn đời nghèo kiết xác.",
  "Was hot shit in high school but never progressed beyond that.": "Từng là một thằng cực ngầu ở trường trung học nhưng cuộc đời chỉ dừng lại ở đó.",
  "Retired dentist who now owns a small farm in Spencer's Mill.": "Một nha sĩ đã nghỉ hưu, hiện đang sở hữu một trang trại nhỏ ở Spencer's Mill.",
  "The man loves cars.": "Người đàn ông có niềm đam mê mãnh liệt với ô tô.",
  "Local diner waitress.": "Nữ bồi bàn tại quán ăn địa phương.",
  "Specializes in clogged drains and right hooks.": "Chuyên gia thông tắc cống và móc hàm bên phải.",
  "Owner of a funky art gallery just outside of town.": "Chủ sở hữu của một phòng tranh nghệ thuật phá cách nằm ngay ngoại ô thị trấn.",
  "Owner of the local mortuary.": "Chủ nhà xác địa phương.",
  "Hits the bottle a little too hard.": "Nốc rượu như uống nước lã.",
  "Micro-brewer who left the big city to open a small pub in town.": "Một thợ ủ bia thủ công đã bỏ lại thành phố xô bồ để mở một quán rượu nhỏ ở thị trấn.",
  "Head of the county's Department of Transportation.": "Người đứng đầu Sở Giao thông vận tải của hạt."
};

function applyTranslations(chunkPath, mapData) {
  if (!fs.existsSync(chunkPath)) return;
  const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  for (const r of chunk.replacements) {
    if (mapData[r.sourceText]) {
      r.translatedText = mapData[r.sourceText];
    }
  }
  fs.mkdirSync('output/languages/bmd_chunks', { recursive: true });
  fs.writeFileSync(chunkPath.replace('input/languages/', 'output/languages/'), JSON.stringify(chunk, null, 2), 'utf8');
}

applyTranslations('input/languages/bmd_chunks/bmd_chunk_13.json', map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_14.json', map);

console.log('Translated BMD Chunk 13 and 14 successfully!');
