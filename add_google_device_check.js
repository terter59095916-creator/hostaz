const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old1 = "const { credential } = req.body || {};\r\n        if (!credential) return res.status(400).json({ error: \x27credential_required\x27 });";
const idx1 = c.indexOf(old1);
console.log("Tapildi 1:", idx1 !== -1);
if (idx1 !== -1) {
  const rep1 = "const { credential, device_id } = req.body || {};\r\n        if (!credential) return res.status(400).json({ error: \x27credential_required\x27 });\r\n        if (device_id) {\r\n          const bannedDevG = db.prepare(\x27SELECT * FROM banned_devices WHERE device_id = ?\x27).get(device_id);\r\n          if (bannedDevG) return res.status(403).json({ error: \x27device_banned\x27 });\r\n        }";
  c = c.replace(old1, rep1);
}

const old2 = "const info = db.prepare(\r\n                \x27INSERT INTO users (username, display_name, avatar_data, google_id) VALUES (?, ?, ?, ?)\x27\r\n            ).run(email, name || email, picture || null, googleId);\r\n            user = db.prepare(\x27SELECT * FROM users WHERE id = ?\x27).get(info.lastInsertRowid);";
const idx2 = c.indexOf(old2);
console.log("Tapildi 2:", idx2 !== -1);
if (idx2 !== -1) {
  const rep2 = "if (device_id) {\r\n              const existingDevG = db.prepare(\x27SELECT user_id FROM device_bindings WHERE device_id = ?\x27).get(device_id);\r\n              if (existingDevG) return res.status(403).json({ error: \x27device_already_used\x27 });\r\n            }\r\n            const info = db.prepare(\r\n                \x27INSERT INTO users (username, display_name, avatar_data, google_id) VALUES (?, ?, ?, ?)\x27\r\n            ).run(email, name || email, picture || null, googleId);\r\n            user = db.prepare(\x27SELECT * FROM users WHERE id = ?\x27).get(info.lastInsertRowid);\r\n            if (device_id) { try { db.prepare(\x27INSERT INTO device_bindings (device_id, user_id, ip_address) VALUES (?, ?, ?)\x27).run(device_id, user.id, getClientIp(req)); } catch (e) {} }";
  c = c.replace(old2, rep2);
}

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
