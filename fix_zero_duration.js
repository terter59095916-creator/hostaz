const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (this.player.getDuration() === 0) {\n        (_a = this.onError) === null || _a === void 0 ? void 0 : _a.call(this, ERR_ZERO_DURATION);\n      }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (this.player.getDuration() === 0) {\n        setTimeout(() => {\n          if (!this.player || this.isDestroyed) return;\n          if (this.player.getDuration() === 0) {\n            (_a = this.onError) === null || _a === void 0 ? void 0 : _a.call(this, ERR_ZERO_DURATION);\n          }\n        }, 800);\n      }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
