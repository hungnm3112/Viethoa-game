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

Dich dan dan bang Gemini:

```bash
npm run translate -- --limit 5
npm run translate -- --group ui --limit 10
npm run translate -- --group dialog --limit 10
```

Can tao file `.env` theo mau `.env.example` truoc khi dich.

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
```

Den dung cau truc:

```text
State of Decay YOSE/Game/languages/english.win.btxt
State of Decay YOSE/Game/libs/ui/class3_frontend.gfx
```

Neu thu muc `languages` hoac `libs/ui` chua ton tai thi tao moi. Cach nay chi override 2 file can test; 95% noi dung con lai van tiep tuc doc tu `gamedata.pak`.
