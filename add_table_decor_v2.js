const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "const tableDecor = session.scheduledGifts.find(s => !!assetsJSON.table_decor[s.id]);\r\n    if (tableDecor) tableView.setTableDecor(assetsJSON.table_decor[tableDecor.id]);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const tableDecor = session.scheduledGifts.find(s => !!assetsJSON.table_decor[s.id]);\r\n    if (tableDecor) {\r\n      tableView.setTableDecor(assetsJSON.table_decor[tableDecor.id]);\r\n    } else if (assetsJSON.table_decor && assetsJSON.table_decor.table_summer) {\r\n      tableView.setTableDecor(assetsJSON.table_decor.table_summer);\r\n    }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
