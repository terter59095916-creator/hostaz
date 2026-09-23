const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("Google ile giris");
const chunk = c.substring(idx-220, idx+30);
fs.writeFileSync("google_giris_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
