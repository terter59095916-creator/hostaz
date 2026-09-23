const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "app.get(\x27/game\x27, (req, res) => {\r\n    res.sendFile(path.join(GAME_DIR, \x27yandex.html\x27));\r\n});";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "app.get(\x27/game\x27, (req, res) => {\r\n    res.redirect(\x27/game-v2\x27);\r\n});";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
