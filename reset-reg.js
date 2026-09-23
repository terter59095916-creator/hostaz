const db = require('./db');
const username = process.argv[2];
if (!username) {
  console.log('İstifadə: node reset-reg.js <username>');
  process.exit(1);
}
db.prepare('UPDATE users SET game_registered = 0 WHERE username = ?').run(username);
console.log('Tamamlandi: ' + username + ' ucun game_registered sifirlandi');
