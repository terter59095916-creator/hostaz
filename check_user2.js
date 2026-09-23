const db = require('./db.js');
const rows = db.prepare("SELECT id, username, display_name, coins, crystals FROM users WHERE display_name LIKE '%\uD83C\uDF1D%' ESCAPE '\\' OR display_name LIKE '%\uD83C\uDF1C%'").all();
if (rows.length === 0) {
  const all = db.prepare("SELECT id, username, display_name FROM users ORDER BY id DESC LIMIT 30").all();
  console.log("Uygun tapilmadi, son 30 istifadeci:");
  console.log(JSON.stringify(all, null, 2));
} else {
  console.log(JSON.stringify(rows, null, 2));
}
