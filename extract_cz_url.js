const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("provider: \x27cz\x27\n            };");
const chunk = c.substring(idx-250, idx+30);
fs.writeFileSync("cz_url_check.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
