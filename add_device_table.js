const fs = require("fs");
const path = "db.js";
let c = fs.readFileSync(path, "utf8");
const old = "try { db.exec('ALTER TABLE users ADD COLUMN gift_level_score INTEGER DEFAULT 0'); console.log('DB-MIGRATION: gift_level_score eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const add = old + "\r\ntry {\r\n  db.exec('CREATE TABLE IF NOT EXISTS device_bindings (device_id TEXT PRIMARY KEY, user_id INTEGER, ip_address TEXT, bound_at TEXT DEFAULT CURRENT_TIMESTAMP)');\r\n  console.log('DB-MIGRATION: device_bindings cedveli hazirdir');\r\n} catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }";
  c = c.replace(old, add);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
