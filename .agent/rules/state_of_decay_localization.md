# State of Decay YOSE Localization Rules

This document outlines critical rules for localizing State of Decay YOSE. Do NOT deviate from these rules unless explicitly requested by the user.

## 1. Nguồn Chân Lý Dữ Liệu (MongoDB Master)
- **Nguồn gốc:** Toàn bộ dữ liệu dịch thuật hiện được lưu tập trung tại MongoDB (`mongodb://127.0.0.1:27017`, DB: `StateOfDecay_VN`, Collection: `translations`). CẤM sử dụng các file JSON rác hoặc chunk làm nguồn dữ liệu chính.
- **Workflow Build:** Trước khi chạy các lệnh nạp text vào game, BẮT BUỘC phải chạy `npm run db:export` để hút dữ liệu mới nhất từ MongoDB ra file `master-translation-db.json`.
- **Phân khu (Zoning):** Dữ liệu trong DB đã được phân chia theo mảng `occurrences` và trường `zone` (VD: `Items`, `Missions`, `Dialog_Subtitle`). Khi cần xử lý text hàng loạt, hãy Query theo `zone` để tránh thay đổi nhầm ngữ cảnh.

## 2. In-Game Dialogue, Tips, and Items (.bmd)
- **Format:** All missions, hints, items, and radio options are stored in `.win.bmd` format inside `libs/class3/...`.
- **CRITICAL LENGTH CONSTRAINT (TRÁNH CRASH):** Game engine (Scaleform) rất dễ sập (Crash `0x0106f0e7`) nếu bạn nới rộng độ dài Text vượt quá độ dài Byte của chuỗi tiếng Anh gốc. Flash UI của game không hề giãn theo nội dung!
- **Quy tắc thao tác BMD:** 
  1. KHÔNG BAO GIỜ được phép dùng Whitelist để bỏ giới hạn độ dài cho bất kỳ file BMD nào.
  2. BẮT BUỘC dùng công cụ `tools/bmd/apply-bmd-manual.js` (công cụ này sẽ tự động cắt cụt - Truncate - các chuỗi dài hơn bản gốc, và đệm khoảng trắng - Space Padding - cho các chuỗi ngắn hơn bản gốc).
- **Deployment Strategy:** Không copy BMD dưới dạng file rời rạc (loose files). BẮT BUỘC phải Build thành file `.pak` bằng lệnh `npm run pak:bmd:apply`.

## 3. Menu and System Text (.btxt)
- **Format:** System texts and main menu strings are stored in `english.win.btxt`.
- **Length Constraint:** Khác với BMD, BTXT được phép dài vô hạn và hỗ trợ full tiếng Việt. Tuy nhiên, CẤM đệm các ký tự Null (`\0`) thừa thãi vào cuối chuỗi. Chỉ giữ đúng 1 ký tự `\0` để kết thúc chuỗi.
- **Workflow:** Use the Expanded BTXT workflow. Lệnh: `npm run deploy-btxt:expanded-pilot`.
- **Deployment Strategy:** The built `english.win.btxt` and `englishau.win.btxt` MUST be placed as **loose files** inside the `Game\languages\` folder. The game prioritizes these loose files over the base `.pak`.

## 4. Fonts and UI (.gfx / .swf)
- **Format:** The game uses Flash-based Scaleform UI. The default font does not support Vietnamese diacritics. We must inject the `Arial` font.
- **Command:** Run `npm run deploy:gfx-fix` to build the font patches and deploy the UI files.
- **Deployment Strategy:** `build-pak.js` explicitly excludes `libs/` from the pak file. Therefore, all `.gfx` and `.swf` files MUST be deployed as **loose files** into `Game\libs\ui\`.
- **Crucial Warning:** Never allow deployment scripts to disable or rename the loose `libs/` folder. Doing so will cause the game to lose the Arial font, resulting in square boxes.

## 5. General Deployment Guidelines
- **Always close the game** before running any `npm run deploy...` or `npm run sync...` commands. The engine locks `.pak` and loose files while running.
- **Always Backup:** Luôn luôn chắc chắn rằng `gamedata.pak` đã được sao lưu trước khi bị lệnh `deploy-all-bmd-pak.js` ghi đè.
- **Test one cluster at a time:** Môi trường game rất mong manh. Hãy cách ly lỗi bằng cách test riêng rẽ BTXT, BMD, hoặc Font. Không nhồi nhét deploy nhiều thành phần chung một lúc.
