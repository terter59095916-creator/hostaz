const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "const calcDrink = () => {\n      const rd = random(gift.random);\n      const rd1 = rd();\n      const rd2 = rd();\n      return {\n        x: photoFrame.x + rd1 * photoFrame.width,\n        y: photoFrame.y + rd2 * photoFrame.height,";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const calcDrink = () => {\n      return {\n        x: photoFrame.x + photoFrame.width,\n        y: photoFrame.y + photoFrame.height,";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("GERI-QAYTARILDI");
}
