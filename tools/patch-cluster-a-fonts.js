import fs from "node:fs";
import path from "node:path";
import { loadArialSourceFont, patchImportedFont } from "./lib/font-replacer.js";

const SOURCE_GFX = "output/gfxdump/libs/ui/class3_pause.gfx";
const SOURCE_FONT_NAME = "Arial";
const TARGETS = [
  "output/gfxdump/libs/ui/menus_startmenu.gfx",
  "output/gfxdump/libs/ui/menus_confirmation.gfx",
  "output/gfxdump/libs/ui/entityflashtag.gfx",
];
const OUTPUT_ROOT = "output/gamedata/libs/ui";

const sourceFont = loadArialSourceFont(SOURCE_GFX, SOURCE_FONT_NAME);

for (const targetFile of TARGETS) {
  patchTarget(targetFile, sourceFont);
}

function patchTarget(targetFile, fontTag) {
  const outputFile = path.join(OUTPUT_ROOT, path.basename(targetFile));
  const replacements = patchImportedFont({
    sourceFontTag: fontTag,
    inputFile: targetFile,
    outputFile,
    importName: "Font_Body",
    targetFontName: "Font_Body",
  });

  console.log(`Wrote ${outputFile}`);
  for (const item of replacements) {
    console.log(
      `- Replaced import ${item.importUrl}::Font_Body with embedded ${SOURCE_FONT_NAME} (fontId ${item.characterId})`,
    );
  }
}
