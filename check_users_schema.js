const db = require("./db.js");
const cols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
console.log(cols.join(", "));
