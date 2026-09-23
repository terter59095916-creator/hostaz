const fs = require("fs");
const path = "db.js";
let c = fs.readFileSync(path, "utf8");
const marker = "console.log(\x27DB-MIGRATION: is_verified eklendi\x27); } catch (e) { console.log(\x27DB-MIGRATION-XETA: \x27 + e.message); }";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const add = marker + "\r\ntry { db.exec(\x27ALTER TABLE users ADD COLUMN external_id TEXT\x27); db.exec(\x27CREATE UNIQUE INDEX IF NOT EXISTS idx_external_id ON users(external_id)\x27); console.log(\x27DB-MIGRATION: external_id eklendi\x27); } catch (e) { console.log(\x27DB-MIGRATION-XETA: \x27 + e.message); }";
  c = c.replace(marker, add);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
