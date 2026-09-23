const db = require('./db.js');
const rows = db.prepare("SELECT id, username, display_name, coins, crystals FROM users WHERE display_name LIKE ? OR username LIKE ?").all('%🌝%', '%🌝%');
console.log(JSON.stringify(rows, null, 2));
