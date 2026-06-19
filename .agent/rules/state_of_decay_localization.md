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
- **Length Constraint**: Modifying `.bmd` files requires preserving the exact byte length of strings (the `samelength` pass) or the game will crash due to broken offset tables.
- **Deployment Strategy**: The game engine strongly prefers **loose BMD files** over those packed in `gamedata.pak` or `dialog.pak`.
- **Crucial Warning**: If `libs/` is disabled as a loose folder, the game will ignore your translated `.bmd` files and load the original English ones from the vanilla `.pak` files.

## 4. General Deployment Guidelines
- **Always close the game** before running any `npm run deploy...` or `npm run sync...` commands. The engine locks `.pak` and loose files while running.
- **Avoid wildcard deletion**: When cleaning up, do not wipe entire loose folders indiscriminately. Only override specific files you are targeting.
- **Test one cluster at a time**: If text encoding is suspected, do not alter `.gfx` fonts in the same test. Isolate variables.
