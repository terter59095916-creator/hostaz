const fs = require("fs");
const path = "db.js";
let c = fs.readFileSync(path, "utf8");
const marker = "console.log('DB-MIGRATION: banned_devices cedveli hazirdir');";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const add = marker + "\r\ntry { db.exec('ALTER TABLE users ADD COLUMN kicked_from_game_id INTEGER'); console.log('DB-MIGRATION: kicked_from_game_id eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }";
  c = c.replace(marker, add);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
