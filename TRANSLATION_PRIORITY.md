# Translation Priority

Muc tieu cua file nay la xac dinh:

- noi dung nao nen viet hoa truoc
- file nao chua nhieu text quan trong
- phan nao tao cam giac "game da duoc viet hoa" som nhat

So lieu duoc rut ra tu `npm run scan` va doc truc tiep cac file XML trong `input/gamedata/`.

## Priority A

### 1. Runtime UI va thong bao trong luc choi

- File: [embeddedstrings.xml](C:\Workspace\Viethoa-game\input\gamedata\languages\embeddedstrings.xml)
- So chuoi: `649`
- Vai tro:
  - thong bao gameplay
  - action prompt
  - popup
  - status text
  - canh bao
  - loot / outpost / enclave / repair / search

Vi du:

- `Zombie Horde Alerted!`
- `Supply Run Complete`
- `Claim Home Site?`
- `Repair (Hold)`
- `Search (Hold)`

Ly do uu tien:

- day la file "gia tri cao nhat / effort hop ly"
- nguoi choi thay tieng Viet ngay khi mo game va choi that
- tac dong lon hon nhieu so voi viec chi doi menu

Trang thai:

- nen la file dau tien duoc dich hang loat that su

### 2. Main menu / title screen

- Dau vao chinh:
  - [english.win.btxt](C:\Workspace\Viethoa-game\output\gamedata\languages\english.win.btxt)
  - [class3_frontend.gfx](C:\Workspace\Viethoa-game\output\gamedata\libs\ui\class3_frontend.gfx)
- Vai tro:
  - menu ngoai game
  - ten muc chon
  - nhan dien ban Viet hoa

Ly do uu tien:

- day la "mat tien" cua ban Viet hoa
- chung ta da co pipeline test thanh cong

Trang thai:

- da xac nhan huong patch hoat dong

## Priority B

### 3. Huong dan cho nguoi choi moi

- File: [hints.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\contentmanager\hints.xml)
- So chuoi: `190`
- Vai tro:
  - tip huong dan
  - giai thich he thong
  - huong dan dieu khien / outpost / vehicle / combat

Vi du:

- `TIP: Hold [sprint] to sprint.`
- `TIP: Outposts create a small SAFE AREA...`
- `TIP: Return home and let someone else take over.`

Ly do uu tien:

- rat huu ich cho 1-2 gio choi dau
- kich thuoc vua phai
- giup nguoi choi hieu co che game nhanh

### 4. Radio command va thao tac chien thuat

- File: [radiooptions.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\contentmanager\radiooptions.xml)
- So chuoi: `56`
- Vai tro:
  - lenh radio
  - scavenger / outpost / home relocation
  - thong bao ly do khong the thuc hien lenh

Vi du:

- `Call for Scavengers`
- `Establish Outpost`
- `No runners available`
- `Building is infested`

Ly do uu tien:

- rat quan trong trong gameplay cot loi
- nho, de hoan thanh nhanh

### 5. Crisis / todo / canh bao the gioi

- File: [todolist.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\contentmanager\todolist.xml)
- So chuoi: `30`
- Vai tro:
  - canh bao nguy hiem
  - morale issue
  - infestation / horde / freak sighting

Vi du:

- `Too Many Infestations`
- `DANGER: Juggernaut Sighting`
- `CRISIS: Malnutrition (Need Food)`

Ly do uu tien:

- nho, de dich
- hien thi nhieu trong gameplay that

## Priority C

### 6. Mission core

- File: [missions.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\contentmanager\missions.xml)
- So chuoi: `1266`
- Vai tro:
  - ten nhiem vu
  - mo ta nhiem vu
  - objective
  - prompt cap nhat tien trinh

Vi du:

- `Investigate the Signal`
- `A Supply Drop?`
- `Search for the source of the signal.`

Ly do uu tien:

- day la phan cot loi cua campaign
- sau khi dich xong, nguoi choi co the theo nhiem vu de dang hon rat nhieu

Ghi chu:

- nen chia batch nho
- uu tien mission som / mission mo dau / CLEO signal / supply drop / home-base related

## Priority D

### 7. He thong co so vat chat va base management

- Files:
  - [facilities.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\rts\facilities.xml) - `612`
  - [rtsevents.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\rts\rtsevents.xml) - `367`
  - [fatecards.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\rts\fatecards.xml) - `637`
  - [search.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\rts\search.xml) - `225`
  - [enclaves.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\rts\enclaves.xml) - `142`

Vai tro:

- xay dung / nang cap / su kien base
- resource logic
- enclave / event / search

Ly do uu tien:

- rat quan trong khi da vao mid-game
- nhieu text he thong, can nhat quan thuat ngu

### 8. Character / skill / item / equipment

- Files:
  - [characters.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\rts\characters.xml) - `759`
  - [items.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\items\items.xml) - `749`
  - [expertise.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\rts\expertise.xml) - `441`

Vai tro:

- ten vat pham
- thuoc tinh vat pham
- ky nang / trait / perk / stat
- thong tin survivor

Ly do uu tien:

- rat nen dich de nguoi choi hieu build nhan vat va vat pham
- nhung co the sau mission / hint / radio

Ghi chu:

- day la nhom de gay "loi thuat ngu" neu dich vo quy cu
- nen co glossary song song

## Priority E

### 9. Scene dialogue / radio / story banter

- File: [scenes.xml](C:\Workspace\Viethoa-game\input\gamedata\libs\class3\contentmanager\scenes.xml)
- So chuoi: `4079`
- Vai tro:
  - hoi thoai
  - radio chatter
  - scene script
  - story flavor

Vi du:

- `Hey. There's something weird coming over the radio...`
- `This is Cleo. Order at DZ.`

Ly do xep sau:

- day la khoi text lon nhat
- ton token nhieu nhat
- can nhieu hau kiem chat luong nhat

Ghi chu:

- rat quan trong cho ban Viet hoa day du
- nhung khong phai diem bat dau toi uu neu muon co ban choi thu som

## Thu tu de xuat

Neu muc tieu la co ban Viet hoa "cam duoc ngay" va co the choi som:

1. `embeddedstrings.xml`
2. `hints.xml`
3. `radiooptions.xml`
4. `todolist.xml`
5. `missions.xml`
6. `facilities.xml` + `rtsevents.xml` + `items.xml` + `characters.xml`
7. `scenes.xml`

## Lo trinh thuc te

### Phase 1 - Ban choi thu som

- Main menu
- `embeddedstrings.xml`
- `hints.xml`
- `radiooptions.xml`
- `todolist.xml`

Ket qua mong doi:

- vao game thay da co tieng Viet ro rang
- choi 1-2 gio dau khong bi "mu" UI

### Phase 2 - Campaign playable

- `missions.xml`
- cac file base management / event / facility co tan suat hien cao

Ket qua mong doi:

- nguoi choi theo nhiem vu va quan ly community duoc

### Phase 3 - Hoan thien trai nghiem

- `items.xml`
- `characters.xml`
- `expertise.xml`
- `scenes.xml`

Ket qua mong doi:

- co ban Viet hoa day dan, tu menu den story dialogue

## Ghi chu ky thuat

- `voices.xml` hien khong scan ra chuoi co ich cho dich
- `text_ui_menus.xml` co text it va khong phai nguon menu thuc te quan trong nhat
- menu chinh dang di qua:
  - `english.win.btxt`
  - `class3_frontend.gfx`

## Hanh dong tiep theo nen lam

1. Tao batch rieng cho `embeddedstrings.xml`
2. Tao batch rieng cho `hints.xml`
3. Tao batch rieng cho `radiooptions.xml`
4. Tao batch rieng cho `todolist.xml`
5. Dich `missions.xml` theo cum mission som / main progression
