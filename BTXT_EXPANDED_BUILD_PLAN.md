# BTXT Expanded Build Plan

## Goal

Build Vietnamese text without being limited by the original English byte length.

The safe in-place BTXT patch is still useful for emergency rollback and tiny smoke tests, but it cannot support comfortable Vietnamese UX because many accented Vietnamese strings are longer than the original English strings.

## Confirmed BTXT Structure

Current `*.win.btxt` files use this structure:

1. `TXDB` magic.
2. 32-bit version field.
3. 32-bit reserved field.
4. 32-bit string count.
5. `count` 32-bit sorted hash/index values.
6. `count` UTF-8 null-terminated strings.

Important finding: the 32-bit values after the header are not direct offsets. They are preserved exactly during rebuild.

## Safe Rebuild Rule

For expanded BTXT:

1. Parse the source BTXT from `data-game-park/gamedata.pak`.
2. Keep header and hash table unchanged.
3. Split the string blob into exactly `count` strings.
4. Replace only selected strings from the pilot manifest.
5. Rebuild the string blob with UTF-8 text and one null terminator per string.
6. Validate that the rebuilt file still has exactly `count` strings.

Never patch variable-length text with raw binary concat unless the whole BTXT file is parsed and rebuilt.

## Pilot Scope

Manifest:

```text
config/btxt-expanded-pilot.json
```

Current pilot targets 10 front-end/common strings:

```text
Continue -> Tiếp tục
Start a New Game -> Bắt đầu trò chơi mới
Select Profile -> Chọn hồ sơ
Leaderboards -> Bảng xếp hạng
Achievements -> Thành tích
Help & Options -> Trợ giúp & Tùy chọn
Exit Game -> Thoát game
Yes -> Có
No -> Không
Close -> Đóng
```

This intentionally includes strings longer than the English source so the test proves whether expanded rebuild is safe.

## Commands

Dry-run first:

```bash
npm run build-btxt:expanded-pilot:dry
```

Build output:

```bash
npm run build-btxt:expanded-pilot
```

Report:

```text
output/reports/build-btxt-expanded-report.json
```

Output files:

```text
output/gamedata/languages/english.win.btxt
output/gamedata/languages/englishau.win.btxt
```

Deploy only BTXT language files:

```bash
npm run sync-btxt-languages
```

## Test Protocol

1. Build expanded pilot only.
2. Copy only language BTXT files into the game.
3. Keep current GFX font files unchanged.
4. Boot the game.
5. Check:
   - main menu labels
   - start-new-game confirmation
   - common `Close` labels
6. If game crashes, restore the latest BTXT backup and do not change GFX/XML at the same time.

## Scale-Up Plan

After the pilot boots cleanly:

1. Expand front-end menu and confirmation dialogs.
2. Add loading/autosave tips.
3. Add pause menu and common HUD labels.
4. Add survivor sheet labels.
5. Add mission objective snippets.
6. Only then consider larger dialogue coverage.

Each scope should get its own manifest so crashes can be narrowed to a small text group.

## Dashboard UX Direction

The dashboard should expose three separate actions:

1. Preview expanded BTXT scope.
2. Build expanded BTXT scope.
3. Deploy only the language files.

The user should not have to run a full translation or full PAK build to test a small BTXT scope.
