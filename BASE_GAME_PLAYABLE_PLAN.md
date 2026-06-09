# Base Game Playable Plan

Muc tieu cua plan nay khong phai "viet hoa toan bo game".

Muc tieu dung hon la:

- trong `1h - 1h30` nua co the vao **State of Decay base game**
- choi duoc phan mo dau va 60-90 phut dau voi muc do de hieu cao
- co tieng Viet o:
  - menu
  - UI trong luc choi
  - text huong dan
  - mission / objective som
  - mot phan hoi thoai / story text som
  - item / facility / radio command co tan suat dung cao

## Co lam duoc khong?

Co, **lam duoc o muc "playable early game"**.

Nhung can noi that:

- **khong** the trong 1h-1h30 ma hoan tat toan bo main campaign, toan bo hoi thoai, toan bo item va lore text
- **co** the dat moc "vao game, choi duoc, hieu duoc nhung gi quan trong trong 60-90 phut dau"

Do la muc tieu hop ly nhat va sat nhu cau cua ban.

## Danh gia thoi gian theo scope

### Scope co the xong trong 1h - 1h30

1. `embeddedstrings.xml`
2. `hints.xml`
3. `radiooptions.xml`
4. `todolist.xml`
5. mot phan `missions.xml`
6. mot phan `scenes.xml`
7. mot phan `items.xml` + `facilities.xml` + `characters.xml`

### Scope khong the xong trong 1h - 1h30

- toan bo `scenes.xml` (`4079` chuoi)
- toan bo `missions.xml` (`1266` chuoi)
- toan bo item / facility / character / expertise text

## Uoc luong theo Gemini

Tu anh rate limit ban gui:

- `Gemini 2.5 Flash`: RPM cao, hop nhat cho batch text
- `Gemini 3.1 Flash Lite`: throughput cao, hop de fallback
- `Gemini 3.1 Pro`: RPM thap hon, nen dung fallback cuoi cho batch kho

Theo docs Google AI cho Gemini API, cac ma model on dinh hien tai gom:

- `gemini-2.5-flash`
- `gemini-2.5-flash-lite`
- `gemini-2.5-pro`

Nguon:

- https://ai.google.dev/gemini-api/docs/models

### Uoc luong thuc te

Neu chi nham vao **base game playable slice**:

- UI + tips + radio + todo: `~925` chuoi
- early missions: `~200-350` chuoi
- early scenes / story: `~300-700` chuoi
- item / facility / character can gap som: `~200-400` chuoi

Tong scope muc tieu:

- `~1,600` den `~2,300` chuoi

Voi batch nho, cache, va khong doi review tung cau theo kieu bien tap:

- **thoi gian goi model**: khoang `20-45 phut`
- **thoi gian ghi file / test / sua loi / copy / vao game kiem tra**: khoang `25-45 phut`

Tong cong:

- **kha thi trong 60-90 phut** neu scope duoc khoa chat

Neu scope phong ra qua rong, se truot moc nay rat nhanh.

## Phase de xong trong 1h - 1h30

### Phase 0 - Nen tang da co

Da co:

- menu chinh viet hoa
- patch `english.win.btxt`
- patch embedded font trong `class3_frontend.gfx`

Muc tieu:

- giu nguyen
- khong mo rong them o phase nay

### Phase 1 - Choi duoc ngay

File uu tien:

1. `input/gamedata/languages/embeddedstrings.xml`
2. `input/gamedata/libs/class3/contentmanager/hints.xml`
3. `input/gamedata/libs/class3/contentmanager/radiooptions.xml`
4. `input/gamedata/libs/class3/contentmanager/todolist.xml`

Tac dung:

- action prompt
- thong bao gameplay
- huong dan
- radio command
- crisis / danger / infestation / morale

Day la phase co ROI cao nhat.

### Phase 2 - Story slice cho base game som

Khong dich toan bo `missions.xml` va `scenes.xml`.

Chi lay:

- mission som / mission mo dau
- signal / Lily / Marcus / Ed / church / scavenging / home-base setup
- scene text lien quan den nhung mission dau

Muc tieu:

- nguoi choi hieu phan intro va flow mo dau

### Phase 3 - Vat pham va he thong gap som

Khong dich toan bo item text.

Chi lay:

- weapon / melee / consumable / backpack / facility / survivor text gap nhieu som
- item / facility / character strings thuoc 60-90 phut dau

Muc tieu:

- inventory, facility, va survivor text du de choi

## Scope de xong nhanh

### Dung scope nay

- `embeddedstrings.xml`
- `hints.xml`
- `radiooptions.xml`
- `todolist.xml`
- subset `missions.xml`
- subset `scenes.xml`
- subset `items.xml`
- subset `facilities.xml`
- subset `characters.xml`

### Khong dung scope nay trong 90 phut

- toan bo `scenes.xml`
- toan bo `missions.xml`
- tat ca item XML nho le trong `scripts/entities/items/xml/weapons`
- tat ca flavor text khong anh huong 60-90 phut dau

## Fallback model

Translator nen dung thu tu:

1. `gemini-2.5-flash`
2. `gemini-2.5-flash-lite`
3. `gemini-2.5-pro`

Ly do:

- `2.5-flash` la lua chon chinh cho throughput / gia tri
- `2.5-flash-lite` dung khi can lat choi nhanh, model chinh bi nghen
- `2.5-pro` de fallback cuoi, khong phai model chay dai hang loat

## Lenh chay de dung cho scope nay

Translator da nen ho tro loc theo file substring.

Vi du:

```bash
npm run translate -- --limit 8 --match=embeddedstrings.xml,hints.xml,radiooptions.xml,todolist.xml
```

Sau do:

```bash
npm run translate -- --limit 10 --match=missions.xml,scenes.xml
```

Va neu can phan system:

```bash
npm run translate -- --limit 10 --match=items.xml,facilities.xml,characters.xml
```

## Ket luan thuc te

Neu muc tieu la:

- "1h-1h30 nua toi muon vao choi base game va hieu phan mo dau"

Thi cau tra loi la:

- **co the lam duoc**
- nhung phai di theo **playable slice**
- khong di theo **translate everything**

## Hanh dong tiep theo nen lam ngay

1. Bat dau dich `embeddedstrings.xml`, `hints.xml`, `radiooptions.xml`, `todolist.xml`
2. Chay batch subset cho `missions.xml` va `scenes.xml`
3. Chay batch subset cho `items.xml`, `facilities.xml`, `characters.xml`
4. Test trong game
5. Neu con thoi gian moi mo rong them
