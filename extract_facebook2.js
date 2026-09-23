const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("app.post(\x27/api/facebook-login\x27");
const chunk = c.substring(idx, idx+950);
fs.writeFileSync("facebook_output2.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
