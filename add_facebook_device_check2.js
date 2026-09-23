const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "db.prepare(\n                \x27INSERT INTO users (username, display_name, avatar_data, facebook_id) VALUES (?, ?, ?, ?)\x27\n            ).run(email, name || email, picture || null, facebookId);\n            user = db.prepare(\x27SELECT * FROM users WHERE id = ?\x27).get(info.lastInsertRowid);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (device_id) {\n              const existingDevF = db.prepare(\x27SELECT user_id FROM device_bindings WHERE device_id = ?\x27).get(device_id);\n              if (existingDevF) return res.status(403).json({ error: \x27device_already_used\x27 });\n            }\n            const info = db.prepare(\n                \x27INSERT INTO users (username, display_name, avatar_data, facebook_id) VALUES (?, ?, ?, ?)\x27\n            ).run(email, name || email, picture || null, facebookId);\n            user = db.prepare(\x27SELECT * FROM users WHERE id = ?\x27).get(info.lastInsertRowid);\n            if (device_id) { try { db.prepare(\x27INSERT INTO device_bindings (device_id, user_id, ip_address) VALUES (?, ?, ?)\x27).run(device_id, user.id, getClientIp(req)); } catch (e) {} }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
