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
- `Continue -> Tiêp tuc`

Result in workspace:

```text
output/gamedata/languages/english.win.btxt
```

Verification:

- ASCII `Continue` is no longer present in the patched file.
- The patched file contains the byte sequence for `Tiêp tuc`.
- This variant keeps the replacement length exactly equal to the original string length.

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
