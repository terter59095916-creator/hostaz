const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "y: frameHeight * 0.55\n  };\n";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1, "sayi:", c.split(old).length - 1);
if (idx !== -1) {
  const replacement = "y: frameHeight - (chatWidth * 0.35) - 350\n  };\n";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
