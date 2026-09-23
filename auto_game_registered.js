const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const newUser = db.prepare(\x27SELECT id FROM users WHERE username = ?\x27).get(username);\r\n        if (newUser && device_id) {";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const newUser = db.prepare(\x27SELECT id FROM users WHERE username = ?\x27).get(username);\r\n        if (newUser) { db.prepare(\x27UPDATE users SET game_registered = 1 WHERE id = ?\x27).run(newUser.id); }\r\n        if (newUser && device_id) {";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
