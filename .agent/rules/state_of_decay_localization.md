# State of Decay YOSE Localization Rules

This document outlines critical rules for localizing State of Decay YOSE. Do NOT deviate from these rules unless explicitly requested by the user.

## 1. Menu and System Text (.btxt)
- **Format**: System texts and main menu strings are stored in `english.win.btxt`.
- **Workflow**: Do NOT use old byte-padding methods (`build-btxt.js`). Use the Expanded BTXT workflow.
- **Command**: Run `npm run deploy-btxt:expanded-pilot`.
- **Deployment Strategy**: The built `english.win.btxt` and `englishau.win.btxt` MUST be placed as **loose files** inside the `Game\languages\` folder. The game prioritizes these loose files over the base `.pak`.
- **Crucial Warning**: Never allow deployment scripts (like `sync-game`) to disable or rename the loose `languages/` folder. Doing so will immediately revert the game menu back to English.

## 2. Fonts and UI (.gfx / .swf)
- **Format**: The game uses Flash-based Scaleform UI. The default font does not support Vietnamese diacritics. We must inject the `Arial` font.
- **Command**: Run `npm run deploy:gfx-fix` to build the font patches and deploy the UI files.
- **Deployment Strategy**: `build-pak.js` explicitly excludes `libs/` from the pak file. Therefore, all `.gfx` and `.swf` files MUST be deployed as **loose files** into `Game\libs\ui\`.
- **Crucial Warning**: Never allow deployment scripts to disable or rename the loose `libs/` folder. Doing so will cause the game to lose the Arial font, resulting in square boxes or a fallback to English default strings.

## 3. In-Game Dialogue, Tips, and Items (.bmd)
- **Format**: All missions, hints, items, and radio options are stored in `.win.bmd` format inside `libs/class3/...`.
- **Length Constraint (Data vs Visual)**: The engine DOES NOT crash if `.bmd` file sizes change (we can safely use `apply-bmd-manual.js` without `build-all-bmd-samelength.js` padding). HOWEVER, the game's Flash UI (`.gfx` files) imposes strict **visual bounding box limits**.
- **UI Clipping Strategy**: Translated strings that exceed Flash UI bounds (e.g., Journal / Events) will be visually truncated. To fix this:
  1. Use `scripts/utils/abbrev-table.json` to define short abbreviations (e.g., "Súng trường" -> "Sung", "CHIẾN THUẬT SINH TỒN:" -> "MẸO:").
  2. Run `scratch/apply-abbreviations.cjs` to map translations.
  3. We plan to build an automated scanner that enforces original English byte-length limits for specific hardcoded UI bounds, applying abbreviations or falling back to English to prevent broken UI layouts.
- **Deployment Strategy**: The game engine strongly prefers **loose BMD files** over those packed in `gamedata.pak` or `dialog.pak`.
- **Crucial Warning**: If `libs/` is disabled as a loose folder, the game will ignore your translated `.bmd` files and load the original English ones from the vanilla `.pak` files.

## 4. Chunk Merging Priority
- When combining multiple translation chunk files (e.g., `btxt_chunk_X.json` or `bmd_chunk_Y.json`), files **MUST be sorted by modified time (`mtime`)** so the most recently translated files take precedence. Do NOT sort alphabetically, as older API bulk translations (e.g., `chunk_104.json`) will overwrite newer manual translations (e.g., `chunk_8.json`).

## 5. General Deployment Guidelines
- **Always close the game** before running any `npm run deploy...` or `npm run sync...` commands. The engine locks `.pak` and loose files while running.
- **Avoid wildcard deletion**: When cleaning up, do not wipe entire loose folders indiscriminately. Only override specific files you are targeting.
- **Test one cluster at a time**: If text encoding is suspected, do not alter `.gfx` fonts in the same test. Isolate variables.
