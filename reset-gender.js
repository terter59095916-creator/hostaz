// reset-gender.js — Bir istifadəçinin gender sahəsini NULL edir (test üçün)
const db = require('./db');
const username = process.argv[2];
if (!username) {
  console.log('İstifadə: node reset-gender.js <username>');
  process.exit(1);
}
db.prepare('UPDATE users SET gender = NULL WHERE username = ?').run(username);
console.log('Tamamlandi: ' + username + ' ucun gender sifirlandi');
