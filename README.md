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

## Test menu nho

Sau khi chay:

```bash
npm run extract -- --group languages
npm run test-menu
```

File test se nam o:

```text
output/gamedata/languages/embeddedstrings.xml
```

Buoc tiep theo can kiem chung voi game:

1. Chuyen XML nay sang dinh dang game that su doc.
2. Thu copy vao dung duong dan ngoai PAK.
3. Mo menu `Help & Options` de xem cac chuoi nhu `Controls` co doi thanh `Dieu khien` khong.

Neu game khong doc XML ngoai, ta se can tim cach tao lai `.win.btxt` hoac dong goi/override dung format ma game load.
