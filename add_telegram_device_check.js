const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const old1 = "const data = req.body || {};\r\n        const { hash, id, first_name, last_name, username, photo_url, auth_date } = data;\r\n        if (!hash || !id) return res.status(400).json({ error: \x27invalid_telegram_data\x27 });\r\n        const crypto = require(\x27crypto\x27);\r\n        const BOT_TOKEN = \x278904330913:AAEsBE5MGsPL9kETTlo_chNpcQJIwTlhwmM\x27;\r\n        const checkFields = Object.keys(data).filter(k => k !== \x27hash\x27).sort();";
const idx1 = c.indexOf(old1);
console.log("Tapildi 1:", idx1 !== -1);
if (idx1 !== -1) {
  const rep1 = "const dataFull = req.body || {};\r\n        const { device_id } = dataFull;\r\n        const data = Object.assign({}, dataFull); delete data.device_id;\r\n        const { hash, id, first_name, last_name, username, photo_url, auth_date } = data;\r\n        if (!hash || !id) return res.status(400).json({ error: \x27invalid_telegram_data\x27 });\r\n        if (device_id) {\r\n          const bannedDevT = db.prepare(\x27SELECT * FROM banned_devices WHERE device_id = ?\x27).get(device_id);\r\n          if (bannedDevT) return res.status(403).json({ error: \x27device_banned\x27 });\r\n        }\r\n        const crypto = require(\x27crypto\x27);\r\n        const BOT_TOKEN = \x278904330913:AAEsBE5MGsPL9kETTlo_chNpcQJIwTlhwmM\x27;\r\n        const checkFields = Object.keys(data).filter(k => k !== \x27hash\x27).sort();";
  c = c.replace(old1, rep1);
}

const old2 = "const info = db.prepare(\r\n                \x27INSERT INTO users (username, display_name, avatar_data, telegram_id) VALUES (?, ?, ?, ?)\x27\r\n            ).run(\x27tg_\x27 + telegramId, displayName, photo_url || null, telegramId);\r\n            user = db.prepare(\x27SELECT * FROM users WHERE id = ?\x27).get(info.lastInsertRowid);";
const idx2 = c.indexOf(old2);
console.log("Tapildi 2:", idx2 !== -1);
if (idx2 !== -1) {
  const rep2 = "if (device_id) {\r\n              const existingDevT = db.prepare(\x27SELECT user_id FROM device_bindings WHERE device_id = ?\x27).get(device_id);\r\n              if (existingDevT) return res.status(403).json({ error: \x27device_already_used\x27 });\r\n            }\r\n            const info = db.prepare(\r\n                \x27INSERT INTO users (username, display_name, avatar_data, telegram_id) VALUES (?, ?, ?, ?)\x27\r\n            ).run(\x27tg_\x27 + telegramId, displayName, photo_url || null, telegramId);\r\n            user = db.prepare(\x27SELECT * FROM users WHERE id = ?\x27).get(info.lastInsertRowid);\r\n            if (device_id) { try { db.prepare(\x27INSERT INTO device_bindings (device_id, user_id, ip_address) VALUES (?, ?, ?)\x27).run(device_id, user.id, getClientIp(req)); } catch (e) {} }";
  c = c.replace(old2, rep2);
}

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
