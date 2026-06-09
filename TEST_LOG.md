# Test log

## 2026-06-08 - Small UI translation workflow test

Goal:

- Test only a tiny part of the translation workflow.
- Do not touch the real game folder.
- Confirm translated output keeps untranslated content intact.

Planned commands:

```bash
npm run scan
npm run translate -- --group ui --limit 1
```

Expected output file to inspect/copy later:

```text
output/gamedata/languages/embeddedstrings.xml
```

Run notes:

- `npm run scan` succeeded.
- First translate attempt failed before reaching Gemini output:
  - npm passed arguments as positional `ui 1`, so `tools/translate.js` needed more tolerant argument parsing.
  - network call failed with `fetch failed` under sandbox.
- Retry after moving job back to pending found a Windows JSON BOM issue caused by PowerShell state rewrite.
- `tools/lib/json-store.js` was updated to tolerate UTF-8 BOM.

## 2026-06-08 - Binary btxt route

Goal:

- Test the real game format: `languages/english.win.btxt`.
- Keep the rest of the game untouched.

Current test output:

```text
output/gamedata/languages/english.win.btxt
```

Copy target:

```text
D:\SteamLibrary\steamapps\common\State of Decay YOSE\Game\languages\english.win.btxt
```

Notes:

- This is the binary file the game actually loads for the menu/localized text path.
- The first binary test caused a crash after being copied into the game.
- Root cause was broad substring replacement across the whole binary, not exact full-string entries.
- The safer patch now only touches one exact null-terminated string entry.

## 2026-06-08 - Diacritic viability test

Goal:

- Check whether the game can display Vietnamese diacritics in `english.win.btxt`.

Current test:

- Exact one-string patch only.
- `Continue -> Tiếp tục`

Result in workspace:

```text
output/gamedata/languages/english.win.btxt
```

Verification:

- ASCII `Continue` is no longer present in the patched file.
- The patched file contains the UTF-8 byte sequence for `Tiếp tục`.
- This test no longer keeps byte length fixed. It follows the real shipped localized `.win.btxt` files, which vary in total size across languages and store accented characters in UTF-8.

## 2026-06-08 - Font override route

Goal:

- Fix the `?` placeholder seen when a Vietnamese diacritic is present in `english.win.btxt`.
- Keep the game logic stable by overriding only the font file the UI already references.

Current test outputs:

```text
output/gamedata/languages/english.win.btxt
output/gamedata/fonts/veramono.ttf
```

Copy targets:

```text
D:\SteamLibrary\steamapps\common\State of Decay YOSE\Game\languages\english.win.btxt
D:\SteamLibrary\steamapps\common\State of Decay YOSE\Game\fonts\veramono.ttf
```

Notes:

- `input/gamedata/fonts/default.xml`, `hud.xml`, and `console.xml` all point to `VeraMono.ttf`.
- `npm run test-font` currently uses `C:/Windows/Fonts/tahoma.ttf` as the override source because it has Vietnamese glyph coverage and is present on a default Windows install.
- This keeps the test narrow: only one localized string plus one font file are overridden, while the rest of the game continues loading from the original `.pak`.

## 2026-06-09 - Embedded UI font investigation

Goal:

- Determine whether the main menu text uses loose `Game/fonts/veramono.ttf` or embedded fonts inside Scaleform `.gfx` assets.

Findings:

- Main menu strings are assigned in ActionScript via plain `.text`, not `.htmlText`, in [output/extracted/libs/ui/flashassets/scripts/class3frontend/class3_frontend.as](C:\Workspace\Viethoa-game\output\extracted\libs\ui\flashassets\scripts\class3frontend\class3_frontend.as).
- The menu asset [output/gfxdump/libs/ui/class3_frontend.gfx](C:\Workspace\Viethoa-game\output\gfxdump\libs\ui\class3_frontend.gfx) contains embedded font resources named `Decaying Kuntry` and `BrainsForSale`.
- The pause/credits asset [output/gfxdump/libs/ui/class3_pause.gfx](C:\Workspace\Viethoa-game\output\gfxdump\libs\ui\class3_pause.gfx) also contains an embedded `Arial` font and uses HTML `<font face="Arial">...</font>` fragments for special characters.
- This strongly suggests the main menu is not driven by loose `veramono.ttf` for the visible title/menu text. Instead, it is using embedded Scaleform font faces from `class3_frontend.gfx`.

Conclusion:

- Replacing `Game/fonts/veramono.ttf` is not sufficient for Vietnamese menu text with diacritics.
- The next real fix path is editing or rebuilding `class3_frontend.gfx` so the menu text field uses a font face with Vietnamese glyph support, most likely `Arial` or another embedded replacement.

## 2026-06-09 - Encoding correction

Goal:

- Verify whether the visible `?` comes from the wrong text encoding rather than from a missing menu glyph.

Findings:

- The shipped files `french.win.btxt`, `german.win.btxt`, and `pt-br.win.btxt` differ in total size from `english.win.btxt`.
- Their accented characters appear in raw bytes as UTF-8 sequences such as `c3 b4`.
- `class3_frontend.gfx` already embeds menu fonts that include at least `ê` and `á`, so the earlier `?` result is more consistent with a bad byte encoding than with a missing glyph.

Action:

- `tools/patch-test-btxt.js` now patches the exact string `Continue` using UTF-8 and allows the file size to change.
- Current test strings include the visible main menu labels in Vietnamese with UTF-8.

## 2026-06-09 - Embedded menu font replacement

Goal:

- Replace the main menu embedded fonts with Arial glyph coverage instead of relying on loose `veramono.ttf`.

Action:

- `tools/patch-test-gfx-font.js` reads [class3_frontend.gfx](C:\Workspace\Viethoa-game\output\gfxdump\libs\ui\class3_frontend.gfx) and swaps the embedded font payload for `Decaying Kuntry` and `BrainsForSale` with the embedded `Arial` font payload taken from [class3_pause.gfx](C:\Workspace\Viethoa-game\output\gfxdump\libs\ui\class3_pause.gfx).
- The target font IDs are preserved so the frontend asset keeps referencing the same symbols, but now with Arial glyph data.

Current output:

```text
output/gamedata/libs/ui/class3_frontend.gfx
```

Copy target:

```text
D:\SteamLibrary\steamapps\common\State of Decay YOSE\Game\libs\ui\class3_frontend.gfx
```

## 2026-06-09 - New Game confirm popup font route

Goal:

- fix Vietnamese glyph loss in the "Start New Game" confirmation popup
- complete the remaining Phase 1 frontend path that does not use `class3_frontend.gfx`

Findings:

- The confirm popup is loaded by [menus_startmenu.as](C:\Workspace\Viethoa-game\output\extracted\libs\ui\flashassets\scripts\mainmenu\menus_startmenu.as:2287) via `Menus_Confirmation.swf`.
- `menus_confirmation.gfx` does not embed its own body font.
- It imports symbol `Font_Body` from `HUD_Font_LocFont.swf`.

Action:

- Added [tools/build-font-swf.js](C:\Workspace\Viethoa-game\tools\build-font-swf.js).
- The script builds a minimal [HUD_Font_LocFont.swf](C:\Workspace\Viethoa-game\output\gamedata\libs\ui\HUD_Font_LocFont.swf) that exports `Font_Body` using the embedded `Arial` font taken from [class3_pause.gfx](C:\Workspace\Viethoa-game\output\gfxdump\libs\ui\class3_pause.gfx).

Current output:

```text
output/gamedata/libs/ui/HUD_Font_LocFont.swf
```

Copy target:

```text
D:\SteamLibrary\steamapps\common\State of Decay YOSE\Game\libs\ui\HUD_Font_LocFont.swf
```

## 2026-06-09 - Cluster A direct embed patch

Goal:

- stop relying on loose `HUD_Font_LocFont.swf`
- embed a Vietnamese-capable body font directly into the front-end assets that were importing `Font_Body`

Action:

- Added [tools/patch-cluster-a-fonts.js](C:\Workspace\Viethoa-game\tools\patch-cluster-a-fonts.js)
- Replaced `Font_Body` imports with embedded `Arial` in:
  - [output/gamedata/libs/ui/menus_startmenu.gfx](C:\Workspace\Viethoa-game\output\gamedata\libs\ui\menus_startmenu.gfx)
  - [output/gamedata/libs/ui/menus_confirmation.gfx](C:\Workspace\Viethoa-game\output\gamedata\libs\ui\menus_confirmation.gfx)
  - [output/gamedata/libs/ui/entityflashtag.gfx](C:\Workspace\Viethoa-game\output\gamedata\libs\ui\entityflashtag.gfx)

Verification:

- `menus_startmenu.gfx` now contains embedded `Arial` with `fontId 27`
- `menus_confirmation.gfx` now contains embedded `Arial` with `fontId 3`
- `entityflashtag.gfx` now contains embedded `Arial` with `fontId 1`

Copy targets:

```text
D:\SteamLibrary\steamapps\common\State of Decay YOSE\Game\libs\ui\menus_startmenu.gfx
D:\SteamLibrary\steamapps\common\State of Decay YOSE\Game\libs\ui\menus_confirmation.gfx
D:\SteamLibrary\steamapps\common\State of Decay YOSE\Game\libs\ui\entityflashtag.gfx
```
