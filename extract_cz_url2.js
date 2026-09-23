const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("CZ-DURATION-DEBUG");
const chunk = c.substring(idx, idx+450);
fs.writeFileSync("cz_url_check2.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
