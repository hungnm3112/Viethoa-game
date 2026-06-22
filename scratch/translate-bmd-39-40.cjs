const fs = require('fs');

const map = {
  // Chunk 39
  "%+d Barrels of Fuel": "%+d Thùng Nhiên Liệu",
  "%+d Daily Rations of Food": "%+d Khẩu Phần Ăn Hàng Ngày",
  "UPGRADED: Refrigerated Storage": "ĐÃ NÂNG CẤP: Kho Lạnh",
  "Additional Food, Ammo, Medicine, Fuel, and Materials capacity.": "Bổ sung sức chứa Lương thực, Đạn dược, Thuốc men, Nhiên liệu và Vật liệu.",
  "SET UP: Alamo Cold Storage": "ĐÃ DỰNG: Kho Lạnh Alamo",
  "SET UP: Farmhouse Storehouse": "ĐÃ DỰNG: Kho Nông Trại",
  "SET UP: Warehouse Storage Area": "ĐÃ DỰNG: Khu Lưu Trữ Nhà Kho",
  "SET UP: Fairgrounds Storage Area": "ĐÃ DỰNG: Khu Lưu Trữ Hội Chợ",
  "SET UP: Refrigerated Storage": "ĐÃ DỰNG: Kho Lạnh",
  "SET UP: Bedroom": "ĐÃ DỰNG: Phòng Ngủ",
  "SET UP: Pastor's Quarters": "ĐÃ DỰNG: Phòng Mục Sư",
  "SET UP: Warehouse Lockers": "ĐÃ DỰNG: Tủ Đồ Nhà Kho",
  "SET UP: Fairgrounds Lockers": "ĐÃ DỰNG: Tủ Đồ Hội Chợ",
  "Provides food daily": "Cung cấp lương thực mỗi ngày",
  "BUILT: Garden": "ĐÃ XÂY: Khu Vườn",
  "Need a Plant Expert": "Cần Một Chuyên Gia Trồng Trọt",
  "Actually owned a farmer's almanac, rumor has it.": "Lời đồn là từng sở hữu một cuốn cẩm nang nhà nông.",
  "Farming Expert: %s": "Chuyên Gia Nông Nghiệp: %s",
  "UPGRADED: Greenhouse": "ĐÃ NÂNG CẤP: Nhà Kính",
  "BUILT: Library": "ĐÃ XÂY: Thư Viện",
  "Need Good Researcher": "Cần Một Nhà Nghiên Cứu Giỏi",
  "Strong background in research and analysis.": "Có kinh nghiệm vững chắc về nghiên cứu và phân tích.",
  "Researcher: %s": "Nhà Nghiên Cứu: %s",
  "Need a Munitions Shop": "Cần Xưởng Đạn Dược",
  "Ammo Manufacture": "Chế Tạo Đạn",
  "Need a Garden": "Cần Một Khu Vườn",
  "Need a Storage Facility": "Cần Một Khu Lưu Trữ",
  "Need a MUNITIONS SHOP": "Cần XƯỞNG ĐẠN DƯỢC",
  "Research Box Mines First": "Nghiên Cứu Mìn Hộp Trước",
  "Need a MEDICAL LAB": "Cần PHÒNG THÍ NGHIỆM Y TẾ",
  "SET UP: Library": "ĐÃ DỰNG: Thư Viện",
  "BUILT: Dining Area": "ĐÃ XÂY: Khu Ăn Uống",
  "SET UP: Dining Area": "ĐÃ DỰNG: Khu Ăn Uống",
  "Need a tools expert.": "Cần một chuyên gia máy móc.",
  "Need a Machine Shop!": "Cần Một Xưởng Cơ Khí!",
  "BUILT: Outpost": "ĐÃ XÂY: Tiền Đồn",
  "BUILT: Watchtower": "ĐÃ XÂY: Tháp Canh",
  "No one available.": "Đéo có ai rảnh.",
  "Keeping an eye out for trouble.": "Để mắt đề phòng rắc rối.",
  "Guard Duty: %s": "Trực Gác: %s",
  "Raises shooting skill for the whole community.": "Tăng kỹ năng bắn súng cho cả cộng đồng.",
  "Shooting Practice": "Luyện Bắn Súng",
  "UPGRADED: Shooting Platform": "ĐÃ NÂNG CẤP: Bệ Bắn",
  "Got word of an area that is rumored to have FOOD.  Let's check it out.": "Có tin đồn về một khu vực có LƯƠNG THỰC. Hãy tới kiểm tra thử.",
  "Located an area that has FOOD.": "Đã xác định khu vực có LƯƠNG THỰC.",
  "Got word of an area that is rumored to have MEDICINE.  Let's check it out.": "Có tin đồn về một khu vực có THUỐC MEN. Hãy tới kiểm tra thử.",
  "Located an area that has MEDICINE.": "Đã xác định khu vực có THUỐC MEN.",
  "Got word of an area that is rumored to have AMMO.  Let's check it out.": "Có tin đồn về một khu vực có ĐẠN DƯỢC. Hãy tới kiểm tra thử.",
  "Located an area that has AMMO.": "Đã xác định khu vực có ĐẠN DƯỢC.",
  "Got word of an area that is rumored to have MATERIALS.  Let's check it out.": "Có tin đồn về một khu vực có VẬT LIỆU. Hãy tới kiểm tra thử.",
  "Located an area that has MATERIALS.": "Đã xác định khu vực có VẬT LIỆU.",
  "Got word of an area that is rumored to have FUEL.  Let's check it out.": "Có tin đồn về một khu vực có NHIÊN LIỆU. Hãy tới kiểm tra thử.",
  "Located an area that has FUEL.": "Đã xác định khu vực có NHIÊN LIỆU.",
  "Good for making and repairing stuff.": "Rất tốt để chế tạo và sửa chữa đồ đạc.",
  "Created 2 Suppressors.": "Đã Chế Tạo 2 Nòng Giảm Thanh.",
  "Created 3 Firecrackers.": "Đã Chế Tạo 3 Pháo Tép.",
  "Created 5 Flame Fougasses.": "Đã Chế Tạo 5 Mìn Lửa.",
  "Created 2 Box Mines.": "Đã Chế Tạo 2 Mìn Hộp.",
  "Created 2 Whistling Box Mines.": "Đã Chế Tạo 2 Mìn Hộp Có Còi.",
  "Created 3 Pipe Bombs.": "Đã Chế Tạo 3 Bom Ống.",
  "Created 3 Steel Pipe Bombs.": "Đã Chế Tạo 3 Bom Ống Thép.",
  "Created 3 Chemical Incendiaries.": "Đã Chế Tạo 3 Đạn Cháy Hóa Học.",
  "We've got some more rounds of .22 ammunition.": "Chúng ta có thêm vài viên đạn cỡ .22.",
  "Created - .22 Ammunition": "Đã Chế Tạo - Đạn .22",
  "We've got some more rounds of 9mm ammunition.": "Chúng ta có thêm vài viên đạn 9mm.",
  "Created some 9mm ammunition.": "Đã chế tạo một ít đạn 9mm.",
  "We've got some more rounds of .357 ammunition.": "Chúng ta có thêm vài viên đạn .357.",
  "Created some .357 ammunition.": "Đã chế tạo một ít đạn .357.",
  "We've got some more rounds of .40 ammunition.": "Chúng ta có thêm vài viên đạn .40.",
  "Created some .40 ammunition.": "Đã chế tạo một ít đạn .40.",
  "We've got some more rounds of .44 ammunition.": "Chúng ta có thêm vài viên đạn .44.",
  "Created some .44 ammunition.": "Đã chế tạo một ít đạn .44.",
  "We've got some more rounds of .45 ammunition.": "Chúng ta có thêm vài viên đạn .45.",
  "Created some .45 ammunition.": "Đã chế tạo một ít đạn .45.",
  "We've got some more rounds of 5.56mm ammunition.": "Chúng ta có thêm vài viên đạn 5.56mm.",
  "Created some 5.56mm ammunition.": "Đã chế tạo một ít đạn 5.56mm.",
  "We've got some more rounds of 7.62mm ammunition.": "Chúng ta có thêm vài viên đạn 7.62mm.",

  // Chunk 40
  "Created some 7.62mm ammunition.": "Đã chế tạo một ít đạn 7.62mm.",
  "We've got some more rounds of .50 BMG ammunition.": "Chúng ta có thêm vài viên đạn .50 BMG.",
  "Created some .50 BMG ammunition.": "Đã chế tạo một ít đạn .50 BMG.",
  "We've got some more shotgun shells.": "Chúng ta có thêm vài viên đạn shotgun.",
  "Created some shotgun ammunition.": "Đã chế tạo một ít đạn shotgun.",
  "We've got some incendiary shotgun ammo. BRING IT ON, ZOMBIES.": "Chúng ta có đạn cháy shotgun rồi. NHÀO VÔ, ZOMBIE.",
  "Created some incendiary shotgun ammunition.": "Đã chế tạo đạn cháy shotgun.",
  "We've got some more rounds of 40mm grenade ammunition.": "Chúng ta có thêm vài viên đạn lựu 40mm.",
  "Created some 40mm grenade ammunition.": "Đã chế tạo đạn lựu 40mm.",
  "Nothing beats a good night's rest.": "Không gì tuyệt hơn một giấc ngủ ngon.",
  "Provides additional places to sleep.": "Cung cấp thêm chỗ ngủ.",
  "Helps keep our people healthy.": "Giúp mọi người giữ được sức khỏe tốt.",
  "Now we can cook up some things.": "Giờ chúng ta có thể nấu nướng vài món rồi.",
  "Created 3 Mild Stims.": "Đã chế tạo 3 Thuốc Kích Thích Nhẹ.",
  "Created 3 Potent Stims.": "Đã chế tạo 3 Thuốc Kích Thích Mạnh.",
  "Created 3 Homemade Painkillers": "Đã chế tạo 3 Thuốc Giảm Đau Tự Chế",
  "Good for fitness and combat training.": "Rất tốt cho việc tập thể hình và huấn luyện chiến đấu.",
  "Fitness Regimen started!": "Chế độ Thể lực đã bắt đầu!",
  "Prepares our people for combat.": "Chuẩn bị cho mọi người chiến đấu.",
  "Combat Training started!": "Huấn luyện Chiến đấu đã bắt đầu!",
  "We opened up our Dojo to train some outsiders. Things went well. They seem more like they can handle themselves. And we improved our stockpiles. It was a win-win. - %1$s.": "Chúng ta đã mở cửa Võ Đường để huấn luyện người ngoài. Mọi việc diễn ra suôn sẻ. Có vẻ như họ đã tự lo liệu được phần nào. Đồng thời kho dự trữ của chúng ta cũng được cải thiện. Đôi bên cùng có lợi. - %1$s.",
  "Gained +3 Ammo.": "Nhận được +3 Đạn.",
  "Prevents food prep problems.": "Ngăn ngừa các vấn đề khi chế biến thức ăn.",
  "We made rations for the road! All it took was some plastic bags and bits of random food.": "Chúng ta đã chuẩn bị khẩu phần đi đường! Chỉ tốn vài cái túi ni lông và chút đồ ăn lặt vặt.",
  "Created 3 Snacks": "Đã Chế Tạo 3 Đồ Ăn Vặt",
  "Someone around here knows how to brew a mean cup of coffee.": "Ai đó quanh đây biết cách pha một tách cà phê hảo hạng.",
  "Made Coffee": "Đã Pha Cà Phê",
  "Nothing better than a homemade pie. Almost covers the smell of rotting death in the air.": "Đéo có gì ngon hơn một cái bánh nướng nhà làm. Gần như át luôn mùi tử thi thối rữa trong không khí.",
  "Baked a Pie": "Đã Nướng Bánh",
  "Everybody's feeling a lot better after that dinner.": "Mọi người đều cảm thấy khá hơn rất nhiều sau bữa tối.",
  "Cooked a Big Meal.": "Đã Nấu Một Bữa Thịnh Soạn.",
  "Just like Thanksgiving.": "Cứ như Lễ Tạ Ơn vậy.",
  "Prepared a Feast.": "Đã Chuẩn Bị Yến Tiệc.",
  "We opened our doors to feed some outsiders. It was an act of charity. - %1$s.": "Chúng ta đã mở cửa cho người ngoài ăn nhờ. Coi như làm từ thiện đi. - %1$s.",
  "Gave away 5 FOOD.": "Đã cho đi 5 LƯƠNG THỰC.",
  "New actions available.": "Hành động mới đã mở khóa.",
  "Lets us store more stuff.": "Cho phép chúng ta lưu trữ thêm đồ đạc.",
  "New food storage options.": "Tùy chọn lưu trữ thức ăn mới.",
  "Created 3 Barrels of Fuel.": "Đã chế tạo 3 Thùng Nhiên Liệu.",
  "Another survivor group approached us after hearing that we'd learned to cure and pickle food to extend its longevity. We traded our expertise for a share of their stockpiles. - %1$s.": "Một nhóm người sống sót khác đã tiếp cận chúng ta sau khi nghe tin chúng ta biết muối chua và phơi khô thực phẩm để bảo quản. Chúng ta đã trao đổi chuyên môn để lấy một phần kho dự trữ của họ. - %1$s.",
  "Gained +5 Food.": "Nhận được +5 Lương Thực.",
  "Gained +5 Ammo.": "Nhận được +5 Đạn.",
  "We can try preserving food here.": "Chúng ta có thể thử bảo quản thực phẩm ở đây.",
  "Provides +8 beds to sleep in. If we have enough beds for everyone, people might even feel rested.": "Cung cấp +8 chiếc giường. Nếu có đủ giường cho mọi người, họ sẽ cảm thấy được nghỉ ngơi thoải mái.",
  "+8 Beds": "+8 Giường",
  "Now we can grow some food.": "Giờ chúng ta có thể tự trồng lương thực rồi.",
  "A greenhouse provides higher yield crops than a garden.": "Nhà kính cung cấp năng suất thu hoạch cao hơn so với khu vườn.",
  "Knowledge is power.": "Kiến thức là sức mạnh.",
  "Gained +2 Ammo.": "Nhận được +2 Đạn.",
  "We've put together a set of tools in the workshop that will let us break down the ammo we scavenge into its basic components, and then manufacture whatever caliber we need. Keep saving your brass!": "Chúng ta đã lắp ráp một bộ dụng cụ trong xưởng để tháo đạn nhặt được thành các thành phần cơ bản, và chế tạo bất kỳ loại đạn nào chúng ta cần. Cứ giữ lại mấy vỏ đạn cũ nhé!",
  "We can now manufacture our own ammunition.": "Bây giờ chúng ta đã có thể tự chế tạo đạn dược.",
  "A greenhouse will improve our crop yields.": "Nhà kính sẽ cải thiện năng suất mùa màng của chúng ta.",
  "Greenhouse available for construction.": "Đã mở khóa xây dựng Nhà Kính.",
  "We can convert some of our food into fuel.": "Chúng ta có thể chuyển hóa một phần thức ăn thành nhiên liệu.",
  "Biodiesel available for production.": "Đã mở khóa chế tạo Xăng Sinh Học.",
  "Box Mines available for construction.": "Đã mở khóa chế tạo Mìn Hộp.",
  "Whistling Box Mines available for construction.": "Đã mở khóa chế tạo Mìn Hộp Có Còi.",
  "Pipe Bombs available for construction.": "Đã mở khóa chế tạo Bom Ống.",
  "Steel Pipe Bombs available for construction.": "Đã mở khóa chế tạo Bom Ống Thép.",
  "Chemical Incendiaries available for construction.": "Đã mở khóa chế tạo Đạn Cháy Hóa Học.",
  "Potent Homemade Stims available for construction.": "Đã mở khóa chế tạo Thuốc Kích Thích Mạnh Tự Chế.",
  "Good for community unity.": "Rất tốt cho sự gắn kết cộng đồng.",
  "This should help us spot incoming hordes. We might even be able to take out a few of them before they get to our base.": "Thứ này sẽ giúp chúng ta phát hiện lũ thây ma đang kéo đến. Có thể chúng ta sẽ hạ được vài con trước khi chúng tới được căn cứ.",
  "Got a new outpost set up.": "Vừa lập xong một tiền đồn mới.",
  "A must-have.": "Một thứ đéo thể thiếu.",
  "We opened up our Shooting Platform to train some outsiders. Things went well. They seem more like they can handle themselves. And we improved our stockpiles. It was a win-win. - %1$s.": "Chúng ta đã mở Bệ Bắn để huấn luyện vài người ngoài. Mọi chuyện diễn ra suôn sẻ. Có vẻ như họ đã tự lo liệu được bản thân. Kho dự trữ của chúng ta cũng được cải thiện. Đôi bên cùng có lợi. - %1$s."
};

function applyTranslations(chunkPath, mapData) {
  if (!fs.existsSync(chunkPath)) return;
  const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  for (const r of chunk.replacements) {
    if (
      r.sourceText.includes('Action.') || 
      r.sourceText.includes('Bonus.') || 
      r.sourceText.includes('Status.') || 
      r.sourceText.includes('Trait.') || 
      r.sourceText.includes('fsEvent.') || 
      r.sourceText.includes('Need.') || 
      r.sourceText.includes('Game.') || 
      r.sourceText.includes('Stat.') || 
      r.sourceText.includes('Stockpile.') || 
      r.sourceText.includes('Capacity.') || 
      r.sourceText.includes('Allow') || 
      r.sourceText.includes('Enclave.') || 
      r.sourceText.includes('LOG:') || 
      r.sourceText.includes('Family.') || 
      r.sourceText.includes('Required,') || 
      r.sourceText.includes('Home, Npc') || 
      r.sourceText.includes('Max.') || 
      r.sourceText.includes('HideAction') || 
      r.sourceText.includes('Car |') || 
      r.sourceText.match(/^[0-9]+ [A-Za-z\_]+$/)
    ) {
      if (r.sourceText === "Need a Plant Expert" || r.sourceText === "Need Good Researcher" || r.sourceText === "Need a Munitions Shop" || r.sourceText === "Need a Garden" || r.sourceText === "Need a Storage Facility" || r.sourceText === "Need a MUNITIONS SHOP" || r.sourceText === "Need a MEDICAL LAB" || r.sourceText === "Need a tools expert." || r.sourceText === "Need a Machine Shop!") {
         // allow these
      } else {
        continue;
      }
    }

    if (mapData[r.sourceText]) {
      r.translatedText = mapData[r.sourceText];
    }
  }
  fs.mkdirSync('output/languages/bmd_chunks', { recursive: true });
  fs.writeFileSync(chunkPath.replace('input/languages/', 'output/languages/'), JSON.stringify(chunk, null, 2), 'utf8');
}

applyTranslations('input/languages/bmd_chunks/bmd_chunk_39.json', map);
applyTranslations('input/languages/bmd_chunks/bmd_chunk_40.json', map);
console.log('Translated BMD Chunk 39 and 40 successfully!');
