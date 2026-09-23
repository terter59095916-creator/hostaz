const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx1 = c.indexOf("let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);");
const chunk1 = c.substring(idx1, idx1+50);
console.log("Google:", JSON.stringify(chunk1));
const idx2 = c.indexOf("let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);");
const chunk2 = c.substring(idx2, idx2+50);
console.log("Telegram:", JSON.stringify(chunk2));
