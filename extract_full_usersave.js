const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const startIdx = c.indexOf("} else if (msg.type === \x27user_save\x27) {");
const endIdx = c.indexOf("} else if (msg.type === \x27kickout_refresh\x27) {");
console.log("startIdx:", startIdx, "endIdx:", endIdx, "uzunluq:", endIdx - startIdx);
const chunk = c.substring(startIdx, endIdx);
fs.writeFileSync("full_usersave_output.txt", chunk);
