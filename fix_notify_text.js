const fs = require("fs");
const path = "game_v2/yandex_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = "💎 100 kristal ödə, masada qal";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  c = c.split(old).join("❤️ 100 ürək ödə, masada qal");
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
