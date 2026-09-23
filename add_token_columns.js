const fs = require("fs");
const path = "db.js";
let c = fs.readFileSync(path, "utf8");
const old = "try { db.exec('ALTER TABLE users ADD COLUMN telegram_id TEXT'); console.log('DB-MIGRATION: telegram_id eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const add = old + "\r\ntry { db.exec('ALTER TABLE users ADD COLUMN live_tokens INTEGER DEFAULT 0'); console.log('DB-MIGRATION: live_tokens eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }\r\ntry { db.exec('ALTER TABLE users ADD COLUMN gift_level_score INTEGER DEFAULT 0'); console.log('DB-MIGRATION: gift_level_score eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }";
  c = c.replace(old, add);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
