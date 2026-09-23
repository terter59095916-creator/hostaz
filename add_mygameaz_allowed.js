const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "var allowed=[\"ureyimsen.com\",\"www.ureyimsen.com\",\"localhost\",\"127.0.0.1\",\"renewed-growth-production-ba28.up.railway.app\"];";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "var allowed=[\"mygame.az\",\"www.mygame.az\",\"localhost\",\"127.0.0.1\",\"renewed-growth-production-ba28.up.railway.app\"];";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
