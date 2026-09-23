const db = require('./db.js');
try {
  db.exec("ALTER TABLE users ADD COLUMN daily_bonus_streak INTEGER DEFAULT 0");
  console.log("Sutun elave olundu.");
} catch (e) {
  console.log("Xeta (ola biler artiq movcuddur): " + e.message);
}
