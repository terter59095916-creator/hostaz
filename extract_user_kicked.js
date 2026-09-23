const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("type: \x27user_kicked\x27,");
const chunk = c.substring(idx-30, idx+350);
fs.writeFileSync("user_kicked_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
