# Ke hoach Viet hoa State of Decay YOSE

## 1. Muc tieu

Tao mot cong cu Node.js chay tren Windows/VS Code de ho tro Viet hoa game State of Decay YOSE bang Gemini API.

Cong cu nay khong thay the hoan toan cong cu mod cua game. No se tap trung vao viec:

- quan ly file ngon ngu da giai nen;
- dich text tu tieng Anh sang tieng Viet;
- chia nho cong viec de phu hop voi gioi han Gemini free tier;
- luu cache de khong dich lai;
- xuat file XML/BMD da dich de dua vao game test.

## 2. Hieu dung ve file ngon ngu cua game

Game co cac file `.pak` lon nhu:

- `gamedata.pak`: nhieu kha nang chua text UI, item, quest, menu, thong bao;
- `dialog.pak` hoac `dialogq.pak`: nhieu kha nang chua hoi thoai NPC/radio.

Ben trong cac file `.pak` co the co cac file ngon ngu dang `.win.bmd`.

Quy trinh thong thuong se la:

```text
.pak goc
  -> giai nen
  -> lay file ngon ngu goc
  -> chuyen BMD sang XML neu can
  -> dich XML
  -> chuyen XML ve .win.bmd
  -> dua file .win.bmd vao dung thu muc game
```

## 3. Diem can kiem chung truoc

Chua nen dich hang loat ngay.

Can kiem chung truoc game co doc file ngon ngu ben ngoai `.pak` hay khong.

Cap nhat sau khi doc file PAK that:

- `gamedata.pak` co the liet ke nhu ZIP, nhung can Node `zlib.inflateSync` de giai nen dung.
- File menu that tim thay trong `languages/embeddedstrings.xml`.
- `languages/text_ui_menus.xml` ton tai nhung khong phai noi chua cac chuoi menu trong anh test.
- `languages/english.win.btxt` co kha nang la file ngon ngu da bien dich ma game load luc chay.
- Nhieu noi dung gameplay/hoi thoai nam trong cac XML o `libs/class3/contentmanager/`.

Co 2 kha nang:

### Kha nang A: game doc file ngoai truoc file trong PAK

Neu game co co che "loose file override", ta chi can dat file `.win.bmd` da sua vao dung duong dan ben ngoai:

```text
State of Decay YOSE/Game/languages/...
```

Khi chay game, game se uu tien file ngoai nay thay cho file ben trong `.pak`.

Day la cach uu tien vi:

- khong can dong goi lai `.pak`;
- it rui ro hon;
- de test nhanh;
- de sua tung file.

### Kha nang B: game chi doc file ben trong PAK

Neu game khong doc file ngoai, ta phai dong goi lai `.pak` hoac dung cach mod rieng cua SoD Tools.

Cach nay se phuc tap va rui ro hon, nen chi lam sau khi test that bai voi cach A.

## 4. Test nho dau tien

Muc tieu cua test nho la sua 1 dong menu de xac nhan game co nhan file ngon ngu ngoai hay khong.

Vi du chuoi can tim:

- `Help & Options`
- `How to Play`
- `Controls`
- `Game Settings`

Quy trinh test:

```text
1. Giai nen gamedata.pak.
2. Tim file ngon ngu co cac chuoi menu tren: hien tai la `languages/embeddedstrings.xml`.
3. Sua file XML test.
4. Sua thu 1 chuoi, vi du:
   Controls -> Dieu khien
5. Xac dinh format game doc thuc te: XML roi, `.win.btxt`, hoac format compiled khac.
6. Copy file da test vao dung thu muc Game/languages/...
7. Mo game va kiem tra menu.
```

Ket qua mong muon:

- Neu menu hien `Dieu khien`, pipeline dung.
- Neu menu khong doi, can kiem tra lai duong dan, ten file, hoac kha nang phai dong goi lai `.pak`.

## 5. Cach uu tien dich

Vi Gemini free tier co gioi han, khong nen dich toan bo game trong mot lan.

Thu tu uu tien:

1. Menu chinh va Help/Options.
2. UI dau game.
3. Nhiem vu dau game.
4. Hoi thoai dau game.
5. Item, skill, thong bao he thong.
6. Cac hoi thoai va noi dung con lai.

UI va hoi thoai co the chay song song ve mat ke hoach, nhung tool nen chia thanh cac job rieng de de tam dung va tiep tuc.

## 6. Cau truc project du kien

```text
Viethoa-game/
  input/
    gamedata/
    dialog/
  output/
    gamedata/
    dialog/
  cache/
    translations.json
  jobs/
    pending.json
    done.json
    failed.json
  tools/
    translate.js
    scan.js
    build-jobs.js
  .env
  .env.example
  package.json
  README.md
  PLAN.md
```

Y nghia:

- `input/`: noi dat XML goc sau khi giai nen/chuyen doi.
- `output/`: noi luu XML da dich.
- `cache/`: luu ban dich theo tung chuoi.
- `jobs/`: luu trang thai viec dich de co the resume.
- `tools/`: cac script Node.js.

## 7. Logic cua tool dich

Tool se lam theo logic:

```text
1. Doc file XML trong input.
2. Tach cac chuoi tieng Anh can dich.
3. Bo qua chuoi da co trong cache.
4. Gom thanh batch nho.
5. Gui batch len Gemini.
6. Nhan JSON ban dich.
7. Kiem tra placeholder va ky tu dac biet.
8. Ghi vao cache.
9. Thay chuoi goc bang chuoi da dich.
10. Xuat XML sang output.
```

Tool phai giu nguyen:

- tag XML;
- ID/key cua chuoi;
- placeholder nhu `{0}`, `{1}`, `%s`, `%d`;
- ky tu xuong dong `\n`;
- cac ma mau, ma dieu khien neu co.

## 8. Cach chay dan dan

Tool khong nen co muc tieu "dich het trong mot lan".

Nen co cac che do:

```text
npm run scan
npm run build-jobs
npm run translate -- --limit 20
npm run translate -- --group ui
npm run translate -- --group dialog
```

Trong do:

- `--limit 20`: chi xu ly 20 job roi dung.
- `--group ui`: chi xu ly nhom UI.
- `--group dialog`: chi xu ly nhom hoi thoai.

Neu bi loi rate limit, mat mang, het quota, tool dung lai nhung van giu tien do trong cache/job.

## 9. Nguyen tac an toan

Truoc khi test tren game:

- sao luu file goc;
- khong sua truc tiep `.pak` neu chua can;
- uu tien copy file ngoai vao thu muc game de test override;
- moi lan test chi sua it chuoi de de biet loi nam o dau.

## 10. Moc hoan thanh giai doan 1

Giai doan 1 duoc xem la thanh cong khi:

```text
Mot chuoi menu trong game duoc sua thu cong
  -> chuyen thanh .win.bmd
  -> copy vao Game/languages/...
  -> mo game thay text da doi.
```

Sau moc nay moi nen bat dau viet tool dich hang loat bang Gemini.
