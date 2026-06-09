# Text Setup Map

Tai lieu nay ghi lai hai lop:

1. Script nao dang `set text`
2. Asset nao dang render text do

Muc tieu la khoanh nhanh cac cum can patch font truoc khi viet hoa sau hon.

## 1. Front-end / menu chinh

Script:

- `output/extracted/libs/ui/flashassets/scripts/class3frontend/class3_frontend.as`
- `output/extracted/libs/ui/flashassets/scripts/mainmenu/menus_startmenu.as`

Text setup chinh:

- `class3_frontend.as:277` `autosave_notice.block_anim.text.text = _notice`
- `class3_frontend.as:347` `menu_title.text.text = _strText`
- `class3_frontend.as:368` `slot.text.text = _strText`
- `class3_frontend.as:377` `slot.menu_widget.switch_slider.text.text = _strLabel`
- `class3_frontend.as:436` `confirm.message.text = _strMessage`
- `class3_frontend.as:448` `ticker.ticker_text.text = _strText`
- `menus_startmenu.as:2284-2311` `showConfirmDiag(...)` va `Root.SubScreen._msg = _message`
- `menus_startmenu.as:2287` `Root.SubScreen.loadMovie("/libs/ui/Menus_Confirmation.swf")`

Asset render:

- `output/gfxdump/libs/ui/class3_frontend.gfx`
- `output/gfxdump/libs/ui/menus_startmenu.gfx`
- `output/gfxdump/libs/ui/menus_confirmation.gfx`
- `output/gamedata/libs/ui/Menus_Confirmation.swf` alias runtime
- `output/gamedata/libs/ui/HUD_Font_LocFont.swf`

Ket luan:

- Popup xac nhan o menu chinh di theo nhanh `menus_startmenu -> Menus_Confirmation.swf -> Font_Body`.

## 2. Pause menu / thong bao trong luc choi

Script:

- `output/extracted/libs/ui/flashassets/scripts/class3hud/class3_pause.as`

Text setup quan trong:

- `PAShowMenu` dat tieu de pause menu
- `HowToShowPage`, `HowToQueuePage`, `HowToSetTitle`
- `USASetText` dat text cho popup thuong / award popup
- `SetMenuTitle`, `SetMenuItem`, `SetMenuItemScrollbar`, `SetMenuButton`
- `AlertShow`
- `AlertShowSlots`
- `LBShow`, `LBSetEntry`
- `BonusDLCShow`
- `CNSetRebindPopup`

Vi tri cu the:

- `class3_pause.as:194-200` rebind popup
- `class3_pause.as:252-276` how-to / guide pages
- `class3_pause.as:412-418` upsell / award popup
- `class3_pause.as:443` menu item body text
- `class3_pause.as:453` slider label
- `class3_pause.as:541-544` alert popup heading + description
- `class3_pause.as:549-555` alert popup slot text
- `class3_pause.as:679-683` leaderboard heading / labels
- `class3_pause.as:789-796` dialog popup / bonus DLC popup

Asset render:

- `output/gfxdump/libs/ui/class3_pause.gfx`

Embedded fonts da xac nhan:

- `Decaying Kuntry`
- `ZomNotes`
- `BrainsForSale`
- `xb`
- `Arial`

Ket luan:

- Toan bo cum thong bao quan trong trong gameplay hien tai deu quy ve `class3_pause.gfx`.
- Neu muon thong bao dung Arial 100%, day la asset uu tien so 1.

## 3. Journal / inventory / mission system

Asset render:

- `output/gfxdump/libs/ui/class3_journal.gfx`
- `output/gfxdump/libs/ui/class3_stats.gfx`

Embedded fonts:

- `class3_journal.gfx`: `Decaying Kuntry`, `BrainsForSale`, `ZomNotes`
- `class3_stats.gfx`: `Decaying Kuntry`

Ket luan:

- Day la cum cho item, survivor, facility, mission/system view.
- Neu viet hoa manh hon trong gameplay, can patch cum nay tiep sau pause/alert.

## 4. Cum chua ket luan xong

Asset:

- `output/gfxdump/libs/ui/class3_notifications.gfx`
- `output/gfxdump/libs/ui/class3hud.gfx`

Tinh trang:

- Co nhieu `EditText`
- Audit parser hien tai chua doc ra font embedded/import mot cach ro rang
- Can dieu tra them neu game van con man hinh thong bao nao vo font sau khi da patch `class3_pause.gfx`

## Quy uoc patch hien tai

- Front-end popup/body font: thay import `Font_Body` bang glyph Arial
- Gameplay thong bao: thay cac embedded font text bang glyph Arial, giu nguyen `fontId` va `fontName`

Ly do:

- Giu nguyen ten font ma text field dang tro toi, chi thay bang glyph cua Arial, it rui ro hon viec doi ten font hang loat.
