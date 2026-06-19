# Font Audit

File report may duoc tao tu:

```bash
npm run font-audit
```

Report JSON:

```text
output/reports/font-audit.json
```

## Tom tat hien tai

- Tong asset UI da scan: `15`
- Asset co embedded font: `4`
- Asset co import font ngoai: `3`
- So `EditText` dang dung font theo `fontClass`: `1090`
- So `EditText` dang dung `fontId` truc tiep: `0`

## Font shader XML cua game

Ba file XML font shader hien tai deu tro toi `VeraMono.ttf`:

- `input/gamedata/fonts/default.xml`
- `input/gamedata/fonts/hud.xml`
- `input/gamedata/fonts/console.xml`

Dieu nay **khong du** de sua het loi font vi phan lon UI Flash/Scaleform khong doc truc tiep tu day.

## Nhom asset dang gay anh huong den Phase 1

### 1. Frontend menu chinh

Asset:

- `output/gfxdump/libs/ui/class3_frontend.gfx`

Embedded fonts:

- `BrainsForSale`
- `Decaying Kuntry`

Tinh trang:

- Day la nhom font cua menu chinh / title / front-end list.
- Da patch thu theo huong thay glyph bang Arial, nhung van con text khac trong flow choi moi bi loi.

### 2. Frontend shared body font

Assets import font nay:

- `output/gfxdump/libs/ui/menus_startmenu.gfx`
- `output/gfxdump/libs/ui/menus_confirmation.gfx`
- `output/gfxdump/libs/ui/entityflashtag.gfx`

Imported font source:

- `HUD_Font_LocFont.swf`
- symbol: `Font_Body`

Tinh trang:

- Day la nhom popup / confirm / body text cua front-end.
- Neu nhom nay chua an font Viet dung, popup `Start New Game` va `Exit Game` se tiep tuc loi o vuong.

### 3. In-game pause / popup / how-to / leaderboard

Asset:

- `output/gfxdump/libs/ui/class3_pause.gfx`

Embedded fonts:

- `Decaying Kuntry`
- `ZomNotes`
- `xb`
- `BrainsForSale`
- `Arial`

Tinh trang:

- File nay da co san `Arial`.
- Nhieu popup in-game va pause menu dua vao asset nay.
- Nhung text field van co the dang tro toi font embedded cu, khong tu dong chuyen sang Arial.

### 4. Journal / system UI trong luc choi

Asset:

- `output/gfxdump/libs/ui/class3_journal.gfx`

Embedded fonts:

- `Decaying Kuntry`
- `BrainsForSale`
- `ZomNotes`

Tinh trang:

- Day la nhom can uu tien neu muon viet hoa inventory, journal, facility, survivor info ma khong vo font.

### 5. Stats screen

Asset:

- `output/gfxdump/libs/ui/class3_stats.gfx`

Embedded fonts:

- `Decaying Kuntry`

## Ket luan ky thuat

Game dang co **2 he font song song**:

1. Font XML shader / `VeraMono.ttf`
2. Font Flash/Scaleform embedded va imported (`class3_frontend.gfx`, `class3_pause.gfx`, `HUD_Font_LocFont.swf`, ...)

Muốn viet hoa on dinh, can coi `Arial` la **font chuan cho cac UI can hien dau tieng Viet**, va patch theo **cum asset**, khong theo tung chuoi text.

## Huong sua dung

### Cum A - Front-end

Patch day du:

- `class3_frontend.gfx`
- `menus_startmenu.gfx`
- `menus_confirmation.gfx`
- `HUD_Font_LocFont.swf`

Muc tieu:

- title / menu list / popup confirm front-end deu hien tieng Viet co dau

### Cum B - Pause / in-game popup

Patch day du:

- `class3_pause.gfx`
- cac popup / alert / dialog text field lien quan

Muc tieu:

- text thong bao / alert / huong dan / leaderboard / pause menu khong vo font

### Cụm C - Journal / gameplay system

Patch day du:

- `class3_journal.gfx`
- `class3_stats.gfx`
- cac asset UI gameplay con lai neu can

Muc tieu:

- item / mission / character / facility / objective co the viet hoa ma van doc duoc

### Cụm D - HUD / Banners / Notifications (Font Injection)

Patch day du:

- `class3hud.gfx`
- `class3_notifications.gfx`
- `class3_radar.gfx`
- `class3_banners.gfx`
- `class3_centerprompts.gfx`
- `class3_survey.gfx`

Tinh trang:

- Nhóm này không nhúng font và không import font. Nó chỉ gọi tên font dưới dạng chuỗi (String).
- Sử dụng công cụ `patch-cluster-d-fonts.js` để **tiêm (inject)** trực tiếp các thẻ DefineFont của Arial vào đầu tệp, ngụy trang thành tên các font cách điệu. Đã khắc phục thành công việc không hiển thị tiếng Việt trên thanh máu, thể lực và bảng thông báo ở giữa màn hình.

## Khuyen nghi

Truoc khi mo rong Phase 2, nen khoa xong **Cum A**, **Cum B**, **Cum C** và **Cum D**.
