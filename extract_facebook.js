const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("app.post(\x27/api/facebook-login\x27");
const chunk = c.substring(idx, idx+900);
fs.writeFileSync("facebook_output.txt", chunk);
console.log("saved, idx=" + idx);
