const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "} else {\n            if (photo_url && photo_url !== user.avatar_data) {\n                db.prepare(\x27UPDATE users SET avatar_data = ?, display_name = ? WHERE id = ?\x27).run(photo_url, displayName, user.id);\n            }\n            console.log(\x27WS: Telegram ile giris - \x27 + d";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "} else {\n            console.log(\x27WS: Telegram ile giris - \x27 + d";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
