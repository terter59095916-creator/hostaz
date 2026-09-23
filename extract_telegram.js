const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("app.post(\x27/api/telegram-login\x27");
const chunk = c.substring(idx, idx+600);
fs.writeFileSync("telegram_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
