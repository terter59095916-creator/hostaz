const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("type: \x27user_save\x27,");
const chunk = c.substring(idx-20, idx+320);
fs.writeFileSync("user_save_broadcast_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
