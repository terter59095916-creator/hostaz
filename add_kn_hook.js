const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "        if (!this.isReportedIncorrectPacket) {\n          this.isReportedIncorrectPacket = true;\n          capture_message(`Incorrect packet number`);\n        }\n      }\n    }\n    this.recv(obj);\n  }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "        if (!this.isReportedIncorrectPacket) {\n          this.isReportedIncorrectPacket = true;\n          capture_message(`Incorrect packet number`);\n        }\n      }\n    }\n    try { window.knOnGameMessage && window.knOnGameMessage(obj); } catch(e) {}\n    this.recv(obj);\n  }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
