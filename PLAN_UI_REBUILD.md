# Plan: Xóa và Xây lại UI Dashboard

> Thuần logic, không code. Đây là bản thiết kế hành vi — triển khai theo bất kỳ cách nào phù hợp với platform.

---

## 1. Chẩn đoán vấn đề hiện tại

### Vấn đề cốt lõi

UI hiện tại được xây theo mô hình **developer analytics dashboard** — cố hiển thị mọi thứ hệ thống biết. Nhưng người dùng thực tế là **operator** đang ngồi chạy dịch, không phải analyst.

Kết quả: người dùng mở dashboard không biết **phải nhấn gì tiếp theo**.

### Các vấn đề cụ thể

**Quá nhiều nguồn dữ liệu đồng thời:**
- Mỗi 5 giây frontend gọi 6–7 HTTP request: regenerate dashboard (POST), lấy dashboard JSON, lấy runs, lấy progress, lấy 3 file job JSON, lấy phase config, lấy scripts.
- Bất kỳ request nào fail → UI hiển thị dữ liệu lỗi thời hoặc trống mà không thông báo rõ ràng.

**Logic nghiệp vụ nằm trong frontend:**
- Frontend tự tính phase stats, resume recommendation, pending file list, top bottleneck files — tất cả là logic backend đã làm hoặc có thể làm.
- Kết quả: frontend có thể tính sai, tính khác backend, và cần maintain ở hai nơi.

**Quá nhiều section không cần thiết:**
- Phase activity log (nhật ký theo phase).
- Top pending files (trùng với file coverage table).
- Phase progress cards (trùng với file coverage table).
- Resume state với badge rows.
- Run history với log viewer riêng.
- Modal tiến trình riêng.
- Run summary sidebar.

→ Tất cả các section trên không giúp operator quyết định nhanh hơn. Chúng chỉ tăng thời gian đọc trang.

**Nút "hành động" bị chôn vùi:**
- Trung tâm hành động nằm ở giữa trang, cần scroll mới thấy.
- Có 20+ nút, không rõ nút nào cần nhấn ngay.
- Logic "nút recommended" phụ thuộc vào nhiều state variable có thể stale.

---

## 2. Người dùng cần gì (và chỉ cần gì)

Operator ngồi trước màn hình. Ba câu hỏi duy nhất trong đầu:

1. **"Đã dịch được bao nhiêu %?"** — tiến độ tổng thể.
2. **"Có gì đang chạy không? Log ra sao?"** — trạng thái hiện tại.
3. **"Bấm gì tiếp theo?"** — hành động tiếp theo.

Mọi thứ không trả lời một trong ba câu trên đều là nhiễu.

---

## 3. Nguyên tắc thiết kế UI mới

**Nguyên tắc 1 — Một hành động chính mỗi lúc**
Tại mọi thời điểm, dashboard chỉ hiển thị **một nút nổi bật nhất** — nút phù hợp với trạng thái hiện tại. Không có lưới 20+ nút bình đẳng.

**Nguyên tắc 2 — Backend tính, frontend hiển thị**
Frontend không tự tính phase stats, resume recommendation, hay bất cứ thứ gì. Chỉ đọc data từ API và render. Nếu data chưa có, hiển thị "đang tải", không tự tính bù.

**Nguyên tắc 3 — Một nguồn sự thật, polling đơn giản**
Frontend chỉ poll **một endpoint duy nhất** mỗi chu kỳ để lấy toàn bộ trạng thái cần hiển thị. Endpoint đó trả về mọi thứ cần thiết trong một response.

**Nguyên tắc 4 — Log là trung tâm khi đang chạy**
Khi có task đang chạy, log output chiếm phần lớn màn hình. Đây là điều operator cần nhất khi chờ task xong.

**Nguyên tắc 5 — Không modal, không scroll**
Toàn bộ thông tin quan trọng nằm trong một màn hình, không cần scroll để thấy nút chính.

---

## 4. Cấu trúc UI mới — 3 vùng

```
┌─────────────────────────────────────────────────────┐
│  VÙNG 1: TIẾN ĐỘ TỔNG THỂ (luôn hiển thị, trên cùng)  │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  VÙNG 2: TRẠNG THÁI VÀ HÀNH ĐỘNG (trung tâm)         │
│                                                      │
│  [Nếu đang chạy]          [Nếu rảnh]                │
│  - Log output              - Nút hành động chính     │
│  - Nút STOP                - Danh sách script phụ   │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  VÙNG 3: BẢNG PHỦ THEO FILE (dưới cùng, tham khảo)   │
└─────────────────────────────────────────────────────┘
```

---

### Vùng 1 — Tiến độ tổng thể

**Nội dung:**
- Số phần trăm dịch tổng thể, hiển thị lớn, đọc được từ xa.
- Thanh progress bar trực quan.
- Hai con số: số chuỗi đã dịch / tổng số chuỗi.
- Tên script đang chạy hoặc dòng trạng thái ngắn (idle / running / error).

**Không có:**
- Session ID, model info, số rollback, số fallback.
- Các số liệu queue chi tiết (pending/done/failed jobs).

**Cập nhật:** Tự động theo chu kỳ polling. Không cần nút refresh riêng.

---

### Vùng 2 — Trạng thái và hành động

Vùng này có **hai trạng thái hiển thị**, chuyển đổi tự động:

#### Trạng thái A: Đang chạy

- **Log output:** Hộp log chiếm ~60% chiều cao vùng này, hiển thị stdout thực của process đang chạy. Auto-scroll xuống dòng mới nhất.
- **Thông tin task:** Tên script, thời gian bắt đầu.
- **Một nút duy nhất:** STOP — màu đỏ, nổi bật.
- **Không có:** Nút chạy script khác, progress modal, tooltip giải thích.

#### Trạng thái B: Rảnh (không có task đang chạy)

- **Nút hành động chính:** Một nút lớn, màu nổi bật, hiển thị tên script được gợi ý tiếp theo. Nút này do backend quyết định (từ trường `recommendedScript` trong API response).
- **Nếu không có gợi ý:** Thay bằng thông báo "Không có queue nào — hãy tạo queue trước".
- **Danh sách script phụ:** Bên dưới nút chính, liệt kê các script còn lại theo nhóm. Giao diện nhỏ hơn, ít nổi bật hơn.
- **Log từ lần chạy trước:** Hiển thị log của task cuối cùng (nếu có) để operator xem kết quả.

---

### Vùng 3 — Bảng phủ theo file

Bảng đơn giản, chỉ đọc:

| Tên file | Đã dịch | Tổng | % |
|----------|---------|------|---|
| embeddedstrings.xml | 120 | 120 | 100% |
| missions.xml | 45 | 200 | 22% |
| ... | ... | ... | ... |

**Không có:**
- Mini progress bar trên mỗi dòng.
- Tooltip giải thích.
- Phân nhóm theo phase.
- Nút hành động trong bảng.

Mục đích duy nhất: nhìn nhanh để biết file nào còn trống.

---

## 5. Luồng dữ liệu

### Polling (mỗi 3 giây)

Frontend gọi **đúng một endpoint**: `/api/status`

Endpoint này trả về một JSON duy nhất gồm:
- Tiến độ tổng thể (% dịch, số chuỗi).
- Trạng thái hiện tại: `idle` hoặc `running`.
- Nếu `running`: tên script, thời gian bắt đầu, log tail (20 dòng cuối).
- Nếu `idle`: script được gợi ý tiếp theo (hoặc null nếu không có queue).
- Danh sách script có thể chạy (theo nhóm).
- Bảng coverage theo file.

**Lưu ý:** Nếu backend chưa có endpoint này, frontend tạm thời có thể tổng hợp từ `/output/reports/translation-dashboard.json` và `/api/progress` — nhưng chỉ hai nguồn đó, không thêm.

### Hành động

- **Chạy script:** POST `/api/run-script` với tên script. Sau khi nhận response 200, bắt đầu polling.
- **Dừng script:** POST `/api/stop-run`. Sau khi nhận response 200, tiếp tục polling cho đến khi status trả về `idle`.
- Không có hành động nào khác cần thiết.

---

## 6. Những thứ cần xóa bỏ

Các phần này được xóa hoàn toàn trong bản mới:

| Phần bị xóa | Lý do |
|-------------|-------|
| Phần "Khả năng tiếp tục" với badge row | Thay bằng nút gợi ý đơn giản |
| Phase activity log | Không có giá trị quyết định cho operator |
| "Tiến độ theo phase" | Trùng lặp với bảng coverage |
| "File còn dang dở" | Trùng lặp với bảng coverage |
| Modal tiến trình riêng | Log nằm thẳng trên màn hình, không cần modal |
| Run history & log viewer | Chỉ cần log của lần chạy gần nhất |
| Run summary sidebar | Không cần thiết |
| Ghi chú nhanh | Không có giá trị thực tế |
| Phần "Phiên xử lý" (session) | Operator không cần session ID |
| Tooltip giải thích trên từng nút | Viết label rõ ràng thay vì tooltip |

---

## 7. Hành vi trạng thái nút

| Tình huống | Nút chính | Nút script phụ |
|-----------|-----------|----------------|
| Idle, có queue pending | Nút script gợi ý, màu xanh/vàng nổi bật | Enabled, màu thường |
| Idle, không có queue | Thông báo "Tạo queue trước" | Enabled (cho phép tạo queue) |
| Đang chạy | Nút STOP, màu đỏ | Disabled hết |
| Đang dừng (giữa STOP và idle) | Spinner "Đang dừng...", disabled | Disabled hết |

---

## 8. Yêu cầu với backend

Để UI mới hoạt động đơn giản, backend cần cung cấp thêm một trường trong response hiện có (hoặc trong endpoint mới):

**Trường `recommendedScript`:** Tên script phù hợp nhất để chạy tiếp, dựa trên:
- Nếu `jobs/pending.json` còn job → script translate tương ứng với phase của jobs đó.
- Nếu không có job pending → null (cần tạo queue).

Logic này hiện đang nằm trong frontend (`resolveResumeScript`). Cần chuyển hoàn toàn về backend.

**Trường `logTail`:** 20–30 dòng cuối của stdout process đang chạy. Backend hiện đã có (`run.logTail` trong runs map).

Nếu backend không được sửa ngay, frontend có thể tạm đọc từ `/api/progress` và `/output/reports/translation-dashboard.json` — nhưng logic `recommendedScript` phải vẫn chạy phía backend, không tự tính trong frontend.

---

## 9. Những thứ giữ nguyên (không thay đổi)

- **Toàn bộ backend** (`serve-dashboard.js`, `translation-monitor.js`, các API endpoint) — không đụng vào.
- **Tất cả npm scripts** — không đổi tên, không thêm bớt.
- **File `styles.css`** — có thể tái sử dụng color scheme và card styles. Chỉ bỏ các class không dùng.
- **Bootstrap 5 + Font Awesome** — giữ nguyên CDN dependencies.
- **Platform vanilla JS** — không thêm framework, không thêm build step.

---

## 10. Thứ tự thực hiện rebuild

1. **Xóa** toàn bộ nội dung `index.html` và `main.js` — bắt đầu từ tờ giấy trắng.
2. **Viết HTML** cho 3 vùng theo cấu trúc mô tả ở mục 4 — chỉ cần 60–80 dòng HTML thực chất.
3. **Viết JS** với vòng polling đơn giản gọi 2 endpoint — target dưới 200 dòng tổng cộng.
4. **Test thủ công** 3 kịch bản: idle không có queue, idle có queue, đang chạy.
5. **Dọn CSS** — xóa các class không còn dùng trong HTML mới.

---

## Tóm tắt

UI mới là một trang với 3 vùng, 2 trạng thái, 2 nút, 1 polling endpoint.

Thay vì cố gắng hiển thị mọi thứ hệ thống biết, UI mới trả lời đúng 3 câu hỏi của operator: bao nhiêu %, có gì đang chạy không, nhấn gì tiếp theo.
