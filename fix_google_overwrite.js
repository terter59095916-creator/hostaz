const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (picture && picture !== user.avatar_data) {\n                db.prepare(\x27UPDATE users SET avatar_data = ?, display_name = ? WHERE id = ?\x27).run(picture, name || user.display_name, user.id);\n            }\n            console.log(\x27WS: Google ile giris - \x27 + email);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "console.log(\x27WS: Google ile giris - \x27 + email);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
