import fs from "node:fs";
import path from "node:path";

const aliases = [
  {
    source: "output/gamedata/libs/ui/menus_confirmation.gfx",
    target: "output/gamedata/libs/ui/Menus_Confirmation.swf",
  },
  {
    source: "output/gamedata/libs/ui/menus_startmenu.gfx",
    target: "output/gamedata/libs/ui/Menus_Startmenu.swf",
  },
  {
    source: "output/gamedata/libs/ui/entityflashtag.gfx",
    target: "output/gamedata/libs/ui/EntityFlashTag.swf",
  },
];

for (const alias of aliases) {
  if (!fs.existsSync(alias.source)) {
    console.warn(`Skip alias, source missing: ${alias.source}`);
    continue;
  }

  fs.mkdirSync(path.dirname(alias.target), { recursive: true });
  fs.copyFileSync(alias.source, alias.target);
  console.log(`Wrote ${alias.target}`);
}
