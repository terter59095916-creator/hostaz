const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "        } : undefined;\n      };\n      (() => __awaiter(this, void 0, void 0, function* () {\n        if (!social.getProfilePhotos) return;";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "        } : undefined;\n      };\n      dlgParams.kickout = getKickoutBtn();\n      dlg.setParams(dlgParams);\n      (() => __awaiter(this, void 0, void 0, function* () {\n        if (!social.getProfilePhotos) return;";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
