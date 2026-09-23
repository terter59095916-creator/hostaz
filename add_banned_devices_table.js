const fs = require("fs");
const path = "db.js";
let c = fs.readFileSync(path, "utf8");
const marker = "console.log('DB-MIGRATION: device_bindings cedveli hazirdir');";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const add = marker + "\r\ntry {\r\n  db.exec('CREATE TABLE IF NOT EXISTS banned_devices (device_id TEXT PRIMARY KEY, ip_address TEXT, banned_at TEXT DEFAULT CURRENT_TIMESTAMP, reason TEXT)');\r\n  console.log('DB-MIGRATION: banned_devices cedveli hazirdir');\r\n} catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }";
  c = c.replace(marker, add);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
