const fs = require("fs");
const path = "db.js";
let c = fs.readFileSync(path, "utf8");
const marker = "console.log('DB-MIGRATION: banned_devices cedveli hazirdir');";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const add = marker + "\r\ntry { db.exec('ALTER TABLE users ADD COLUMN daily_kiss_league_points INTEGER DEFAULT 0'); console.log('DB-MIGRATION: daily_kiss_league_points eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }\r\ntry { db.exec('ALTER TABLE users ADD COLUMN daily_kiss_league_limit INTEGER DEFAULT 20'); console.log('DB-MIGRATION: daily_kiss_league_limit eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }\r\ntry { db.exec('ALTER TABLE users ADD COLUMN daily_kiss_limit_date TEXT'); console.log('DB-MIGRATION: daily_kiss_limit_date eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }";
  c = c.replace(marker, add);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
