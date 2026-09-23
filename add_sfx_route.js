const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "app.use(express.static(GAME_DIR));";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = old + "\r\napp.use('/mg-sfx', express.static(path.join(__dirname, 'butilochka.cdnvideo.ru', 'bottle', 'bundle', 'sfx')));";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
