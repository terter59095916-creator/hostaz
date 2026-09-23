const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (device_id) {\r\n            const existingDevice = db.prepare('SELECT user_id FROM device_bindings WHERE device_id = ?').get(device_id);\r\n            if (existingDevice && existingDevice.user_id !== user.id) {\r\n                return res.status(403).json({ error: 'device_already_used' });\r\n            }\r\n            if (!existingDevice) {\r\n                try { db.prepare('INSERT INTO device_bindings (device_id, user_id, ip_address) VALUES (?, ?, ?)').run(device_id, user.id, getClientIp(req)); } catch (e) {}\r\n            }\r\n        }\r\n        const token = authLib.issueUserToken(user);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (device_id) {\r\n            const existingDevice = db.prepare('SELECT user_id FROM device_bindings WHERE device_id = ?').get(device_id);\r\n            if (!existingDevice) {\r\n                try { db.prepare('INSERT INTO device_bindings (device_id, user_id, ip_address) VALUES (?, ?, ?)').run(device_id, user.id, getClientIp(req)); } catch (e) {}\r\n            }\r\n        }\r\n        const token = authLib.issueUserToken(user);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
} else {
  console.log("MARKER TAPILMADI - basqa yontemle yoxlamaq lazimdir");
}
