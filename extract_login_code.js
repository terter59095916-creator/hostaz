const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("app.post(\x27/api/login\x27");
const chunk = c.substring(idx, idx + 1200);
fs.writeFileSync("login_code_output.txt", chunk);
console.log("saved");
