# Localization Decision Log

Purpose:

- Keep a compact record of what was proven while localizing State of Decay YOSE.
- Avoid repeating crash-prone tests.
- Separate source/authoring files from runtime files the game actually loads.

Last confirmed test: 2026-06-12.

## Current Stable Baseline

Game folder:

```text
D:\SteamLibrary\steamapps\common\State of Decay YOSE\Game
```

Confirmed working menu test:

- `Game\languages\english.win.btxt`
- `Game\languages\englishau.win.btxt`

The current menu can show ASCII Vietnamese strings:

```text
Tiep tuc
Choi moi
Chon ho so
Xep hang
Thanh tich
Tro giup
Thoat
```

Important note:

- This is Vietnamese without diacritics.
- This was intentional for the safe smoke test.
- Diacritics are a separate font/encoding problem and should not be mixed into crash triage.

## Proven Runtime Paths

### Main Menu Text

Correct runtime files:

```text
languages/english.win.btxt
languages/englishau.win.btxt
```

Evidence:

- Copying translated `embeddedstrings.xml` alone did not change visible menu text.
- Patching `english*.win.btxt` changed visible menu text immediately.
- The visible menu labels `Start a New Game`, `Help & Options`, `Exit Game`, etc. were found inside BTXT.

Conclusion:

- Main menu text must be localized through BTXT, not loose XML.

### Loose Embedded Strings XML

Source/output files:

```text
input/gamedata/languages/embeddedstrings.xml
output/gamedata/languages/embeddedstrings.xml
Game\languages\embeddedstrings.xml
```

What is known:

- The file can be copied into `Game\languages`.
- It can contain translated strings.
- It did not affect the visible main menu/autosave text in current tests.

Conclusion:

- Treat `embeddedstrings.xml` mostly as source/authoring data for BTXT or for systems not yet proven.
- Do not expect loose `embeddedstrings.xml` to localize the main menu.

### Tips and Tutorial Text

Likely source:

```text
input/gamedata/libs/class3/contentmanager/hints.xml
```

Examples found there:

```text
TIP: Press [crouch] to turn your flashlight on or off.
The survivor page is where you view your progress...
```

Current status:

- Not yet proven as a safe runtime loose override.
- May require `.win.bmd` runtime build or PAK route.

Conclusion:

- Do not assume copying `hints.xml` loose will work.
- Test hints as a small isolated cluster later.

## Crash-Prone Changes

### Bad BTXT Padding With Null Bytes

Bad behavior:

- Replacing a long null-terminated string with a shorter string.
- Filling all remaining bytes with `00`.

Example bad transformation:

```text
Start a New Game\0
Choi moi\0\0\0\0\0\0\0\0\0
```

Observed result:

- Game crashed or exited before menu.
- No new `.dmp` was found in the game folder.
- No useful StateOfDecay entry was found in Windows Event Log/WER during this test.

Likely reason:

- BTXT appears to be a sequential string table or indexed data blob.
- Extra null bytes can create empty entries or shift expected string parsing.

Rule:

- Never pad shorter BTXT replacements with extra null terminators.

### Broad Binary Replacement

Bad behavior:

- Replacing substrings broadly across the whole binary.
- Replacing non-unique text without verifying exactly one match.

Observed/recorded result:

- Earlier binary BTXT tests caused crash.

Rule:

- Only patch exact null-terminated strings.
- Only patch if the match is unique.
- Skip ambiguous strings.

### Deploying Broad Output Into Game

Risky command:

```bash
npm run sync-game
```

Reason:

- It may deploy many generated files at once.
- It may include patched BTXT, PAK, BMD, GFX, or loose folders whose safety is not currently proven together.

Rule:

- For smoke tests, copy only the small file cluster being tested.
- Keep backup per test.

## Confirmed Safe BTXT Patch Style

Correct behavior:

- Keep original file size unchanged.
- Patch only exact null-terminated full string entries.
- If translated text is shorter, pad with spaces, not null bytes.
- Keep exactly one final `00` terminator.

Example good transformation:

```text
Start a New Game\0
Choi moi        \0
```

Current tool:

```text
tools/build-btxt.js
```

Current command:

```bash
npm run build-btxt
```

Current safe output:

```text
output/gamedata/languages/english.win.btxt
output/gamedata/languages/englishau.win.btxt
```

Current copy targets:

```text
Game\languages\english.win.btxt
Game\languages\englishau.win.btxt
```

Current confirmed behavior:

- Game reaches menu.
- Menu text changes to ASCII Vietnamese.

## Safe Deployment Rules

Before copying files:

- Close `StateOfDecay.exe`.
- Back up the current target files.
- Copy only the tested cluster.
- Verify the target file contains expected strings after copy.

Recommended BTXT smoke copy:

```text
copy output/gamedata/languages/english.win.btxt    -> Game/languages/english.win.btxt
copy output/gamedata/languages/englishau.win.btxt  -> Game/languages/englishau.win.btxt
```

Do not copy:

```text
output/gamedata/languages/*.win.btxt
```

as a broad wildcard unless the source set is known and verified.

## Rollback Notes

Recent known backup folders:

```text
Game\_codex_btxt_smoke_backup\20260612-211956
Game\_codex_btxt_spacepad_backup\20260612-212901
```

Meaning:

- `smoke_backup` was created before the null-padded BTXT test.
- `spacepad_backup` was created before the space-padded BTXT test.

If a BTXT test crashes:

1. Close the game.
2. Restore `english.win.btxt` and `englishau.win.btxt` from the latest backup made before the test.
3. Re-test game boot before changing anything else.

## Diacritics Status

Current visible result:

- Vietnamese without diacritics works in menu.

Not yet solved:

- Vietnamese with diacritics.

Known related systems:

- BTXT stores text bytes.
- Main menu rendering uses Scaleform/GFX embedded fonts.
- `class3_frontend.gfx` contains embedded fonts such as `Decaying Kuntry` and `BrainsForSale`.
- Loose `fonts/veramono.ttf` is not enough for main menu text.

Rule:

- Do not add diacritics to broad BTXT/menu patches until the font route is isolated again.
- Test diacritics with one string only.

## Next Recommended Plan

## 2026-06-12 Update: Diacritic Menu BTXT Probe

Status:

- Built and deployed a small UTF-8 diacritic BTXT patch for menu labels.
- File size is still unchanged.
- Replacement still uses the safe rule: fill remaining bytes with spaces and keep exactly one final null terminator.
- Deployed files:

```text
Game/languages/english.win.btxt
Game/languages/englishau.win.btxt
```

Backup before deploy:

```text
D:\SteamLibrary\steamapps\common\State of Decay YOSE\Game\_codex_btxt_diacritic_backup\20260612-214247
```

Confirmed strings present in both game BTXT files:

```text
Chơi mới
Hồ sơ
Xếp hạng
Thành tích
Trợ giúp
Thoát
Tiếp
```

Notes:

- `Continue -> Tiếp tục` is too long for the original `Continue\0` field, so current safe patch uses `Tiếp`.
- `Select Profile -> Chọn hồ sơ` is too long by 1 byte, so current safe patch uses `Hồ sơ`.
- `Close -> Đóng` is too long for `Close\0`, so it is intentionally skipped.
- If the game boots but accents render as boxes or broken glyphs, the next issue is font/GFX, not BTXT string encoding.
- Do not attempt variable-length BTXT patching yet; it may invalidate internal offsets.

Runtime verification:

- User tested the deployed diacritic BTXT build in game.
- Game boots and menu text changes, so the BTXT patch is being loaded.
- Vietnamese accent glyphs render as square boxes in the main menu.
- This confirms the current blocker is the Scaleform/GFX menu font, not BTXT encoding.
- The ASCII/no-accent menu is still the stable fallback if the font probe causes problems.

Implication:

- Keep the diacritic BTXT patch logic, but do not expand accented text coverage until the UI font route is fixed.
- Next work should target the front-end UI font cluster only.
- Do not mix font/GFX changes with XML/BMD/PAK text expansion during this probe.

## 2026-06-12 Update: Cluster A Front-End Font Probe

Status:

- Built and deployed a front-end UI font probe.
- Scope is limited to menu/front-end font assets only.
- No XML/BMD/text expansion was deployed in this step.

Build commands:

```text
npm run patch-cluster-a
npm run build-font-swf
npm run build-ui-aliases
```

Deployed files:

```text
Game/libs/ui/class3_frontend.gfx
Game/libs/ui/menus_startmenu.gfx
Game/libs/ui/menus_confirmation.gfx
Game/libs/ui/entityflashtag.gfx
Game/libs/ui/HUD_Font_LocFont.swf
Game/libs/ui/Menus_Startmenu.swf
Game/libs/ui/Menus_Confirmation.swf
Game/libs/ui/EntityFlashTag.swf
```

Backup before deploy:

```text
D:\SteamLibrary\steamapps\common\State of Decay YOSE\Game\_codex_cluster_a_font_backup\20260612-215525
```

Technical intent:

- `class3_frontend.gfx`: replace embedded `Decaying Kuntry` and `BrainsForSale` font glyph data with Arial glyph data from `class3_pause.gfx`.
- `menus_startmenu.gfx`, `menus_confirmation.gfx`, `entityflashtag.gfx`: replace imported `Font_Body` with embedded Arial glyph data.
- `HUD_Font_LocFont.swf`: export `Font_Body` using the same Arial glyph data.
- Alias SWFs are deployed because menu ActionScript loads `Menus_Startmenu.swf`, `Menus_Confirmation.swf`, and `EntityFlashTag.swf`.

Test expectation:

- If the game boots and Vietnamese accents render correctly in the main menu, Cluster A is the correct font route.
- If the game boots but accents are still boxes, `class3_frontend.gfx` text fields may still point to font classes that need deeper symbol/font mapping.
- If the game crashes or front-end UI disappears, rollback only the Cluster A files from the backup above.

### Phase A: Stabilize Menu Text

Goal:

- Keep menu translated without crash.

Method:

- Continue using `tools/build-btxt.js`.
- Prefer UTF-8 Vietnamese with accents only when the replacement fits inside the original byte budget.
- Use shorter Vietnamese labels when the full accented translation is too long.
- Patch a small set of unique menu strings only.

### Phase B: One-String Diacritic Probe

Goal:

- Determine whether diacritics fail because of BTXT encoding or embedded font glyphs.

Current result:

- BTXT can contain UTF-8 Vietnamese strings.
- Runtime rendering still needs user/game verification.

Method:

- Patch one unique menu string only.
- Use UTF-8 Vietnamese.
- Do not patch multiple strings in the same test.
- If the game boots but glyphs are wrong, the next issue is font rendering.

### Phase C: Font/GFX Probe

Goal:

- Make menu render Vietnamese diacritics.

Likely files:

```text
libs/ui/class3_frontend.gfx
libs/ui/menus_startmenu.gfx
libs/ui/menus_confirmation.gfx
libs/ui/HUD_Font_LocFont.swf
```

Rule:

- Test one UI asset cluster at a time.
- Do not combine font/GFX changes with large text/BMD/PAK changes.

### Phase D: Gameplay Tips

Goal:

- Localize tutorial tips and help panels.

Likely file:

```text
libs/class3/contentmanager/hints.xml
```

Unknown:

- Whether the game loads loose XML for hints.
- Whether it requires `.win.bmd`.

Method:

- Patch one obvious tip.
- Test loose XML first only if isolated.
- If no effect, build/deploy only the matching BMD.

## Short Rules To Remember

- Menu text: BTXT.
- Loose `embeddedstrings.xml`: not enough for menu.
- Tips: likely `hints.xml` or BMD, not yet proven.
- BTXT shorter replacement: pad with spaces, keep one null terminator.
- Extra null padding in BTXT can crash.

## 2026-06-12 Update: Expanded BTXT Rebuild Plan

### New Finding

The BTXT format is now understood enough for a controlled variable-length rebuild:

```text
TXDB header
version/reserved/count
count * uint32 hash/index values
count null-terminated UTF-8 strings
```

The 32-bit table after the header is not a direct string offset table. Preserve it exactly.

### New Rule

For Vietnamese text longer than the English source, do not patch bytes in place.

Use the expanded rebuild flow:

```text
tools/lib/btxt.js
tools/build-btxt-expanded.js
config/btxt-expanded-pilot.json
```

The pilot scope should stay at 5-10 front-end strings until the game confirms the rebuilt BTXT boots cleanly.

### Dashboard Scripts

```text
npm run build-btxt:expanded-pilot:dry
npm run build-btxt:expanded-pilot
npm run sync-btxt-languages
```

Report:

```text
output/reports/build-btxt-expanded-report.json
```

### Test Rule

When testing expanded BTXT, change only:

```text
Game/languages/english.win.btxt
Game/languages/englishau.win.btxt
```

Keep GFX/XML/PAK unchanged during this specific smoke test.

### Confirmed Result

User runtime test confirmed:

- Game boots cleanly with the expanded BTXT pilot.
- Main menu text is localized with Vietnamese diacritics.
- The longer Vietnamese strings no longer require shortening to fit the original English byte length.
- Cluster A front-end font patch is required and works with the expanded BTXT pilot.

### Rule To Keep

For front-end/menu text, the preferred safe path is now:

```text
Cluster A font files already deployed
BTXT expanded rebuild from original gamedata.pak
copy only languages/english.win.btxt and languages/englishau.win.btxt
```

Do not go back to broad binary string replacement for longer Vietnamese text.
Do not deploy broad PAK/XML/BMD changes in the same test as a BTXT expansion.

Dashboard-safe commands:

```text
npm run build-btxt:expanded-pilot:workflow
npm run deploy-btxt:expanded-pilot
```

The deploy workflow must:

1. Dry-run expanded BTXT first.
2. Build only after validation passes.
3. Back up current game BTXT files.
4. Copy only `english.win.btxt` and `englishau.win.btxt`.

### Dashboard UX Note

Observed after first dashboard deploy test:

- `Build + copy BTXT pilot` did run successfully.
- The game files were copied and backed up correctly.
- The dashboard looked like "nothing happened" because the persistent translation queue notice had priority over the just-finished deploy action.

Rule:

- Short build/deploy actions must show their own recent success/failure message even when translation jobs are still pending.
- After starting an action from the dashboard, refresh progress immediately instead of waiting for the next polling interval.
- Broad deploy can crash.
- ASCII Vietnamese menu currently works.
- Diacritics are not fixed yet; treat as separate font/encoding task.
