const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (!user || !authLib.bcrypt.compareSync(current_password, user.password_hash)) {\n        return res.status(400).json({ error: \x27wrong_current_password\x27 });\n    }\n    const newHash = authLib.bcrypt.hashSync(new_password, 10);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (!user || !bcrypt.compareSync(current_password, user.password_hash)) {\n        return res.status(400).json({ error: \x27wrong_current_password\x27 });\n    }\n    const newHash = bcrypt.hashSync(new_password, 10);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
