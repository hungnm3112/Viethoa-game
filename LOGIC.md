# Viethoa Game — Logic Tổng Thể

> File này mô tả **logic nghiệp vụ thuần túy**, không phụ thuộc vào cách cài đặt hiện tại.
> Đọc file này để hiểu hệ thống làm gì và tại sao — không phải code đang viết như thế nào.

---

## Mục đích hệ thống

Dịch toàn bộ text tiếng Anh của game **State of Decay YOSE** sang tiếng Việt, rồi đưa bản dịch đó vào game để người chơi đọc được.

---

## Tổng quan luồng xử lý

```
Game gốc (.pak)
    → Giải nén lấy XML
    → Phân tích, lên kế hoạch dịch
    → Gọi Gemini API để dịch (theo từng lô)
    → Ghi bản dịch ra file output XML
    → Đóng gói lại (btxt / font / assets)
    → Sao chép vào thư mục game
    → Người chơi thấy tiếng Việt
```

---

## Các giai đoạn xử lý

### Giai đoạn 0 — Giải nén

**Mục tiêu:** Lấy các file văn bản (XML) ra khỏi file pak của game.

**Logic:**
- File pak của game là định dạng nén giống ZIP.
- Giải nén và lọc ra chỉ các file cần dịch: `.xml`, `.btxt`, `.drl`.
- Lưu vào thư mục `input/` để xử lý tiếp.

**Đầu vào:** File pak gốc từ game.
**Đầu ra:** Cây thư mục `input/` chứa XML.

---

### Giai đoạn 1 — Quét & kiểm kê

**Mục tiêu:** Biết chính xác có bao nhiêu chuỗi cần dịch trong từng file.

**Logic xác định chuỗi cần dịch:**
- Lấy nội dung từ thẻ `<Data>`, và các thuộc tính XML có tên là `text`, `title`, `label`, `name`, `desc`, `description`, `hint`, `caption`, `message`.
- Một chuỗi được tính là cần dịch nếu:
  - Dài từ 2 đến 800 ký tự.
  - Có ít nhất một chữ cái tiếng Anh.
  - Không phải định danh kỹ thuật (UPPERCASE_IDENTIFIER, tên file như `file.xml`, số thuần túy).
  - Không phải chuỗi một từ viết thường không có khoảng trắng.
- Chuỗi chứa placeholder như `{0}`, `%s`, `<b>`, `[CODE]` vẫn được dịch — chỉ giữ nguyên phần placeholder.

**Đầu vào:** Toàn bộ XML trong `input/`.
**Đầu ra:** Thống kê số chuỗi theo từng file.

---

### Giai đoạn 2 — Lập hàng đợi công việc (Job Queue)

**Mục tiêu:** Chia nhỏ việc dịch thành các đơn vị công việc có thể xử lý độc lập, ưu tiên phần quan trọng trước.

**Logic:**
- Đọc cấu hình pha dịch (phase1, phase2, phase3) để biết file nào thuộc ưu tiên nào.
- Với mỗi file XML:
  - So sánh bản gốc (`input/`) với bản dịch đang có (`output/`).
  - Những chuỗi chưa được dịch → gom vào một danh sách.
  - Cắt danh sách đó thành các lô ~40 chuỗi mỗi lô.
  - Mỗi lô = một job.
- Mỗi job lưu: id, nhóm ưu tiên, đường dẫn file nguồn, đường dẫn file đích, danh sách chuỗi cần dịch.

**Ưu tiên job:**
| Nhóm | Loại file | Lý do |
|------|-----------|-------|
| `ui` | Menu, ngôn ngữ, HUD | Người chơi thấy ngay từ đầu |
| `dialog` | Mission, scene, voice | Nội dung chính của game |
| `gameplay` | Items, characters, facilities | Quan trọng nhưng có thể sau |
| `misc` | Phần còn lại | Không khẩn |

**Đầu vào:** File XML input + output hiện tại + config pha.
**Đầu ra:** File hàng đợi `pending.json`.

---

### Giai đoạn 3 — Dịch thuật (Vòng lặp chính)

**Mục tiêu:** Dịch từng job, lưu kết quả, chịu lỗi được, không dịch lại cái đã dịch.

#### 3.1 — Cache check trước

Trước khi gọi API, kiểm tra cache. Chuỗi nào đã dịch rồi → dùng luôn, không gọi API.

Cache được lưu vĩnh viễn. Không bao giờ dịch lại cùng một chuỗi hai lần.

#### 3.2 — Gọi Gemini API

Với các chuỗi chưa có trong cache:
- Gửi một mảng JSON các chuỗi nguồn.
- Yêu cầu Gemini trả về JSON object `{ "chuỗi gốc": "bản dịch" }`.
- Cài nhiệt độ thấp (0.2) để bản dịch nhất quán, ít sáng tạo quá.
- Yêu cầu giữ nguyên tất cả placeholder.

**Chuỗi prompt cốt lõi:**
> Dịch sang tiếng Việt tự nhiên phù hợp game zombie. Giữ nguyên tất cả `{0}`, `%s`, `\n`, `<tag>`, `[CODE]`.

#### 3.3 — Fallback model

Nếu model chính bị lỗi tạm thời (quá tải, rate limit, timeout):
- Thử lần lượt qua danh sách model dự phòng (cấu hình trong `.env`).
- Chờ 1.5 giây giữa các lần thử.
- Ghi lại sự kiện "model-fallback" để theo dõi.

#### 3.4 — Kiểm tra placeholder

Sau khi nhận bản dịch từ API:
- Trích xuất tất cả placeholder từ chuỗi gốc.
- Kiểm tra bản dịch có đủ các placeholder đó không (cùng tập, không quan tâm thứ tự).
- Nếu thiếu → từ chối kết quả, requeue job, không lưu.

#### 3.5 — Lưu kết quả

- Cập nhật cache với tất cả translation mới.
- Đọc file XML input.
- Thay thế chuỗi gốc bằng chuỗi dịch trong XML (chỉ thay value, giữ nguyên cấu trúc XML).
- Backup file output hiện tại trước khi ghi đè.
- Ghi file output mới.
- Chuyển job từ `pending` sang `done`.
- Cập nhật session: đếm số job, số chuỗi, thời gian.

#### 3.6 — Xử lý lỗi & retry

```
Job thất bại:
    Lần 1 & 2 → requeue (đẩy lại vào pending, tăng attempts)
    Lần 3 trở đi → chuyển vào failed.json (cần xử lý thủ công)
```

**Lý do lỗi tạm thời:** API timeout, overloaded, rate limit → retry.
**Lý do lỗi vĩnh viễn:** API key sai, placeholder mismatch sau 3 lần → mark failed.

---

### Giai đoạn 4 — Đóng gói cho game

Sau khi dịch xong XML, cần chuyển dữ liệu sang định dạng game đọc được:

#### 4A — File BTXT (embedded text)
- Game đọc file nhị phân `.btxt` chứa các chuỗi nhúng sẵn (menu, HUD).
- Logic: tìm từng chuỗi gốc theo byte trong file nhị phân → replace bằng bytes UTF-8 bản dịch.
- Chỉ thay khi tìm thấy đúng một lần (tránh ambiguous).
- Đầu ra: file `.btxt` đã patch, sẵn sàng để thay thế file gốc.

#### 4B — Font UI (SWF/GFX)
- Game dùng Flash/GFX để render font. Bộ font mặc định không có dấu tiếng Việt.
- Logic: trích xuất font từ asset gốc → nhúng vào file SWF riêng (`HUD_Font_LocFont.swf`) → game load thêm file này khi khởi động.
- Patch các file UI `.gfx` để tham chiếu font mới thay vì font cũ.

---

### Giai đoạn 5 — Deploy vào game

- Đọc danh sách file cần copy từ manifest cấu hình.
- Copy từng file từ `output/` vào thư mục cài đặt game thực.
- Game load file loose (không pack lại pak) → override nội dung gốc.

---

## Cơ chế lưu trữ trạng thái

### Nguyên tắc: dual storage (MongoDB + file)

Mọi trạng thái quan trọng được lưu ở **cả hai nơi**:
- MongoDB: truy vấn nhanh, đồng bộ giữa các tiến trình.
- File JSON/NDJSON: fallback khi MongoDB không có, backup tự nhiên.

Khi đọc: thử MongoDB trước, nếu không có thì đọc file.
Khi ghi: luôn ghi cả hai.

### Các trạng thái chính

| Trạng thái | Nội dung |
|-----------|----------|
| `jobs/pending.json` | Hàng đợi job chưa làm |
| `jobs/done.json` | Job đã hoàn thành |
| `jobs/failed.json` | Job thất bại sau 3 lần |
| `cache/translations.json` | Tất cả cặp dịch đã có |
| `output/reports/translation-session.json` | Thống kê phiên hiện tại |
| `output/reports/translation-dashboard.json` | Dữ liệu cho dashboard |
| `output/reports/translation-events.ndjson` | Log sự kiện bất biến |

### Session (phiên dịch)

Một phiên dịch theo dõi:
- Số job đã xử lý, số thành công.
- Số chuỗi mới dịch, số lấy từ cache.
- Trạng thái: `running` | `paused` | `completed`.
- Lỗi gần nhất, lần fallback model.
- Thời gian bắt đầu, hoàn thành.

Phiên cho phép **resume**: dừng giữa chừng → tiếp tục → không làm lại job cũ.

---

## Dashboard

### Mục đích

Giao diện web để operator (người chạy dịch) quan sát tiến độ và kích hoạt các lệnh mà không cần dùng terminal.

### Dữ liệu hiển thị

- Tổng chuỗi cần dịch / đã dịch / phần trăm.
- Số job pending / done / failed.
- Phân rã theo từng file XML.
- Log sự kiện gần nhất (job thành công, lỗi, fallback model).
- Trạng thái job đang chạy (nếu có).

### Hành động operator

- Chạy bất kỳ script nào trong `package.json` bằng nút bấm.
- Dừng script đang chạy.
- Refresh dữ liệu dashboard.
- Xem lịch sử các lần chạy trước.

### Cơ chế cập nhật

- Frontend polling mỗi 5 giây.
- Server expose API JSON cho dashboard data.
- Mỗi lần chạy script được track (stdout, exit code, thời gian).

---

## Backup & Rollback

### Backup tự động

Mỗi khi ghi file output XML:
1. Sao lưu file cũ vào `output/rollback/[path].[timestamp].bak` trước.
2. Ghi file mới.
3. Nếu ghi thất bại → tự động khôi phục từ backup.

### Rollback thủ công

- Quét tất cả file `.bak`.
- Nhóm theo đường dẫn đích, chỉ giữ bản mới nhất mỗi file.
- Cho phép restore toàn bộ hoặc lọc theo tên file.

---

## Cấu hình

| Biến | Ý nghĩa |
|------|---------|
| `GEMINI_API_KEY` | API key để gọi Gemini |
| `GEMINI_MODEL` | Model chính (mặc định: gemini-2.5-flash) |
| `GEMINI_MODELS` | Danh sách fallback models, phân cách dấu phẩy |
| `MONGODB_URI` | URI kết nối MongoDB (bỏ qua = dùng file) |
| `SOD_GAME_ROOT` | Đường dẫn thư mục game để deploy |
| `DASHBOARD_PORT` | Port HTTP server dashboard |

---

## Lưu kết quả liên tục (Continuous Persistence)

**Nguyên tắc:** Không bao giờ để mất kết quả dịch đã nhận từ Gemini.

Mỗi khi Gemini trả về một batch kết quả:
1. Ghi ngay vào `cache/translations.json` (file) **và** MongoDB `translations_cache` (nếu có).
2. Ghi file XML output với bản dịch mới.
3. Di chuyển job từ `pending.json` sang `done.json`.
4. Cập nhật session stats.

Tất cả 4 bước xảy ra **trước khi** chuyển sang job tiếp theo. Nếu crash giữa chừng sau bước 1, batch đó đã an toàn trong cache — không cần gọi Gemini lại.

**Ý nghĩa:** Có thể dừng/crash bất cứ lúc nào mà không mất token đã tiêu.

---

## Cơ chế Resume sau crash / dừng bất ngờ

**Khi nào cần resume:**
- Process bị kill (Ctrl+C, crash hệ thống).
- User nhấn Stop từ dashboard.
- Máy tắt giữa chừng.

**Cơ chế tự động:**
- Khi translate.js khởi động, nó đọc `translation-session.json`.
- Nếu session có status `running` hoặc `paused` → tiếp tục phiên cũ, không tạo mới.
- `jobs/pending.json` vẫn giữ nguyên các job chưa xong.
- Cache đã có sẵn các chuỗi đã dịch → không gọi API lại.

**Hai cách resume từ Dashboard:**

| Nút | Script gọi | Khi nào dùng |
|-----|-----------|--------------|
| **▶ Bắt đầu Việt hóa** | `translate:all` | Bắt đầu mới hoặc tiếp tục với queue được dựng lại từ đầu |
| **↺ Tiếp tục** | `translate:resume` | Tiếp tục chính xác từ điểm dừng — giữ nguyên `pending.json` hiện tại |

`translate:resume` dùng flag `--rebuild=false` — pipeline không tạo lại queue, chỉ chạy tiếp các job còn trong pending.

**Điều kiện hiển thị nút Tiếp tục:**
- Lần chạy cuối có status `stopped` (user dừng) hoặc `failed` (crash/lỗi).
- Và vẫn còn job trong `pending.json`.

---

## Sửa bản dịch không chính xác

### Cách 1: Sửa cache trực tiếp (sửa thủ công)

File `cache/translations.json` lưu tất cả cặp `{ "chuỗi gốc": "bản dịch" }`.

Để sửa một bản dịch sai:
1. Mở `cache/translations.json`.
2. Tìm chuỗi gốc tiếng Anh (key).
3. Sửa giá trị (value) thành bản dịch đúng.
4. Lưu file.
5. Chạy lại build (rebuild queue + translate) để ghi lại vào XML output.

Nếu dùng MongoDB: sửa trực tiếp trong collection `translations_cache`, document có `key` là chuỗi gốc.

### Cách 2: Thử lại job lỗi (nút dashboard)

Khi có job trong `jobs/failed.json` (thất bại sau 3 lần thử):
- Nhấn **↩ Thử lại X job lỗi** trên dashboard.
- Backend di chuyển toàn bộ job lỗi về `jobs/pending.json`, reset attempts về 0.
- Chạy lại `translate:resume` để dịch lại các job đó.

### Cách 3: Chạy lại một phase cụ thể

Nếu muốn dịch lại toàn bộ một phase (ví dụ phase1):
1. Chạy `build-jobs:phase1` để tạo lại queue cho phase1.
2. Chạy `translate:phase1` để dịch lại.
3. Các chuỗi đã đúng trong cache sẽ không bị gọi Gemini lại.
4. Chỉ các chuỗi **không có trong cache** mới được gọi API.

**Lưu ý:** Để buộc dịch lại chuỗi đã có trong cache (ví dụ kết quả Gemini lần trước tệ), hãy xóa key đó khỏi `cache/translations.json` trước khi chạy lại.

---

## Các quy tắc nghiệp vụ quan trọng

1. **Không dịch lại chuỗi đã dịch** — cache là vĩnh viễn, tiết kiệm chi phí API.
2. **Ưu tiên UI trước** — người chơi thấy menu/HUD trước tiên.
3. **Giữ nguyên placeholder tuyệt đối** — `{0}`, `%s`, `[CODE]` sai là game crash.
4. **Không pack lại pak** — dùng loose file để game override, dễ rollback.
5. **Job là đơn vị nhỏ nhất** — thất bại một job không ảnh hưởng các job khác.
6. **Resume không mất công** — mọi tiến độ được lưu, dừng lúc nào cũng tiếp tục được.
7. **Dual storage cho reliability** — không phụ thuộc vào MongoDB, file là fallback.
8. **Log event bất biến** — mọi sự kiện quan trọng ghi vào NDJSON, không xóa, không sửa.
9. **Lưu ngay sau mỗi batch** — không bao giờ để mất kết quả Gemini đã trả về.
10. **Sửa cache để sửa dịch** — `cache/translations.json` là nguồn sự thật, sửa ở đó rồi rebuild.

---

## Pha dịch (Translation Phases)

| Pha | Nội dung | Ưu tiên |
|-----|---------|---------|
| **phase1** | Menu UI, HUD, loading tips, radio UI | Cao nhất — game playable cơ bản |
| **phase2** | Mission text, scene dialogue, story | Cao — trải nghiệm chính |
| **phase3** | Items, characters, facilities, events | Trung bình — hoàn chỉnh |
| **playable-base** | Tổ hợp phase1 + phase2 + items/characters cốt lõi | Milestone sớm ra bản thử |

---

## Sơ đồ luồng đầy đủ

```
[Game .pak files]
      │
      ▼
  GIẢI NÉN ──────────────────► input/**/*.xml
      │
      ▼
  QUÉT & KIỂM KÊ ────────────► biết tổng số chuỗi
      │
      ▼
  LẬP HÀNG ĐỢI ──────────────► jobs/pending.json
      │                          (lô 40 chuỗi, ưu tiên UI→dialog→gameplay)
      ▼
  ┌─ VÒNG LẶP DỊCH ──────────────────────────────────────┐
  │                                                        │
  │  job = lấy từ pending                                 │
  │      │                                                 │
  │      ├─ Chuỗi đã có trong cache? ──► lấy luôn        │
  │      │                                                 │
  │      └─ Chưa có → gọi Gemini API                      │
  │              │                                         │
  │              ├─ OK → validate placeholder              │
  │              │         │                               │
  │              │         ├─ OK → lưu cache, ghi output  │
  │              │         └─ Lỗi → requeue job           │
  │              │                                         │
  │              └─ Lỗi tạm thời → thử fallback model     │
  │                   └─ Vẫn lỗi sau 3 lần → failed      │
  │                                                        │
  │  Cập nhật session, emit event                         │
  └────────────────────────────────────────────────────────┘
      │
      ▼
  output/**/*.xml (đã dịch)
      │
      ├──► BUILD BTXT ─────────► output/*.btxt (binary text)
      │
      ├──► BUILD FONT ─────────► HUD_Font_LocFont.swf
      │       │
      │       └──► PATCH GFX ──► output/*.gfx (UI assets)
      │
      ▼
  DEPLOY ────────────────────► [Game folder] (loose files override pak)
      │
      ▼
  [Người chơi thấy tiếng Việt]
```
