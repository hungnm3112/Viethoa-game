# Viet hoa State of Decay YOSE

Tool Node.js nay lam viec truc tiep voi cac file `.pak` da copy vao `data-game-park/`.

## Ket luan tu file that

`data-game-park/gamedata.pak` doc duoc nhu mot ZIP archive, nhung Windows/.NET/tar khong giai nen duoc truc tiep vi payload Deflate cua game can `zlib.inflateSync`.

Vi vay project co extractor rieng trong `tools/lib/pak.js`.

Trong `gamedata.pak` da tim thay:

- `languages/text_ui_menus.xml`
- `languages/embeddedstrings.xml`
- `languages/english.win.btxt`
- nhieu cap `libs/.../*.xml` va `libs/.../*.win.bmd`

`dialog.pak` hien chu yeu la file audio `.mp3`. Text hoi thoai co kha nang nam trong XML cua `gamedata.pak`, dac biet:

- `libs/class3/contentmanager/missions.xml`
- `libs/class3/contentmanager/scenes.xml`
- `libs/class3/contentmanager/radiooptions.xml`
- `libs/class3/voice/voices.xml`

## Lenh chay

Trich xuat XML tu PAK:

```bash
npm run extract
```

Chi trich xuat nhom language de test menu nhanh:

```bash
npm run extract -- --group languages
```

Thong ke chuoi co the dich:

```bash
npm run scan
```

Tao job dich:

```bash
npm run build-jobs
```

Tao job theo phase uu tien:

```bash
npm run build-jobs:phase1
npm run build-jobs:phase2
npm run build-jobs:phase3
```

Dich dan dan bang Gemini:

```bash
npm run translate -- --limit 5
npm run translate -- --group ui --limit 10
npm run translate -- --group dialog --limit 10
```

Chay nhanh theo phase:

```bash
npm run translate:phase1 -- --limit 5
npm run translate:phase2 -- --limit 5
npm run translate:phase3 -- --limit 5
```

Chay full pipeline va tu resume neu bi ngat:

```bash
npm run translate:all
```

Xem do phu ban dich:

```bash
npm run translation-status:phase1
npm run translation-status -- --profile=phase2
```

Sinh dashboard JSON va mo UI bao cao local:

```bash
npm run dev
```

Hoac neu muon tach rieng:

```bash
npm run dashboard:generate
npm run dashboard:serve
```

Sau do mo:

```text
http://localhost:4173/
```

Dashboard local hien tai:

- tu dong doc toan bo `npm run` trong `package.json`
- co the bam chay lenh truc tiep tu UI
- hien trang thai `running/success/failed`
- hien log gan nhat cua moi lan chay
- `npm run dev` uu tien kill tien trinh dang chan port dashboard roi moi bind lai

Can tao file `.env` theo mau `.env.example` truoc khi dich.

## MongoDB luu trang thai

Project hien tai ho tro luu vao MongoDB neu co:

```text
MONGODB_URI
MONGODB_DB
```

Mongo duoc dung de luu:

- translation cache
- job queue state
- translation session
- dashboard state
- event log / phase activity / command runs

Neu Mongo tam thoi khong san sang, he thong se fallback ve file mirror trong workspace.

## Phase viet hoa de choi som

`phase1`:

- `embeddedstrings.xml`
- `hints.xml`
- `radiooptions.xml`
- `todolist.xml`

Day la cum co gia tri cao nhat de vao game khong bi "mu" UI.

`phase2`:

- `missions.xml`
- `scenes.xml`

Tap trung cho campaign mo dau, objective, story slice.

`phase3`:

- `items.xml`
- `facilities.xml`
- `characters.xml`
- `expertise.xml`
- cac file RTS lien quan

## Log, rollback va resume

Bao cao tong hop:

```text
output/reports/translation-dashboard.json
```

Session hien tai:

```text
output/reports/translation-session.json
```

Event log:

```text
output/reports/translation-events.ndjson
```

Backup rollback:

```text
output/rollback/
```

Khoi phuc output gan nhat:

```bash
npm run rollback:output
```

Translator hien tai:

- co fallback model theo `.env`
- se requeue job neu loi tam thoi
- khong lap lai chuoi da dich trong `output/` hoac da co trong `cache/translations.json`
- khi chay lai `npm run translate:all`, tien trinh se tiep tuc tren phan con lai

Neu muon dong bo file `output` vao game that de test nhanh:

```bash
npm run sync-game
```

Script nay doc:

- `config/deploy-manifest.json`
- bien moi truong `SOD_GAME_ROOT` trong `.env` neu ban muon doi thu muc game

Luu y ve fallback model:

- translator khong con tu chen danh sach model mac dinh nua
- no chi fallback qua cac model ban khai bao trong `.env`
- `GEMINI_MODEL` la model chinh
- `GEMINI_MODELS` la danh sach fallback, phan tach bang dau phay
- can dung **exact Gemini API model ids**, khong dung ten hien thi trong AI Studio

## Test file that game doc truc tiep

Tao file `english.win.btxt` test nho:

```bash
npm run test-btxt
```

Ban hien tai tao mot test UTF-8 nho:

```text
Continue -> Tiếp tục
```

Tao font override de thu ky tu tieng Viet:

```bash
npm run test-font
```

Tao ban `class3_frontend.gfx` da doi embedded menu font sang glyph kieu Arial:

```bash
npm run test-gfx-font
```

Tao thu vien font body cho popup/xac nhan frontend:

```bash
npm run build-font-swf
```

Va patch truc tiep cum A cua frontend de embed Arial vao cac asset dang import `Font_Body`:

```bash
npm run patch-cluster-a
```

Mac dinh `test-font` copy `C:/Windows/Fonts/tahoma.ttf` thanh:

```text
output/gamedata/fonts/veramono.ttf
```

Neu muon dung font khac:

```bash
npm run test-font -- --source=C:/Windows/Fonts/arial.ttf
```

## Test menu nho

Neu muon test XML menu:

```bash
npm run extract -- --group languages
npm run test-menu
```

File XML test se nam o:

```text
output/gamedata/languages/embeddedstrings.xml
```

Nhung game that hien tai khong doc XML roi nay cho menu, nen luong test thuc te la `english.win.btxt`.

## File can copy vao game de test dau tien

Copy 2 file nay:

```text
output/gamedata/languages/english.win.btxt
output/gamedata/libs/ui/class3_frontend.gfx
output/gamedata/libs/ui/HUD_Font_LocFont.swf
```

Den dung cau truc:

```text
State of Decay YOSE/Game/languages/english.win.btxt
State of Decay YOSE/Game/libs/ui/class3_frontend.gfx
State of Decay YOSE/Game/libs/ui/HUD_Font_LocFont.swf
```

Neu thu muc `languages` hoac `libs/ui` chua ton tai thi tao moi. Cach nay chi override 2 file can test; 95% noi dung con lai van tiep tuc doc tu `gamedata.pak`.

## Dong goi va copy vao game

Muc tieu chinh cua project la dong goi lai file `.pak`, khong rai loose XML/BMD vao thu muc game.

Runtime cua game doc cac file `.win.bmd` trong `gamedata.pak` cho mission, subtitle, item va RTS.
XML la source/authoring; copy moi XML se khong lam subtitle/item doi trong game.

Moi khi ket thuc mot phase, build artifact runtime, dong goi lai pak, roi sync:

```bash
npm run build-game
npm run sync-game
```

`build-game` thuc hien:

- build `english.win.btxt`
- build cac `.win.bmd` runtime tu XML da dich
- build `output/paks/gamedata.pak`

Neu muon chay tung buoc:

```bash
npm run build-runtime
npm run build-bmd
npm run build-pak
```

File pak da build nam o:

```text
output/paks/gamedata.pak
```

`sync-game` se:

- yeu cau game da tat
- backup pak goc vao `Game/_codex_pak_backup/...`
- vo hieu hoa cac thu muc loose override cu nhu `libs`, `scripts`, `languages`, `fonts`
- copy pak da build vao thu muc `Game`

```bash
npm run sync-game
```
