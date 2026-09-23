const db = require('./db');
const result = db.prepare('UPDATE users SET game_registered = 0').run();
console.log('Tamamlandi: ' + result.changes + ' istifadeci sifirlandi');
