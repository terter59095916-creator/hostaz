const db = require('./db.js');
const count = db.prepare("SELECT COUNT(*) as c FROM users").get();
console.log("Cemi istifadeci sayi: " + count.c);
