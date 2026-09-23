const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("msg.type === \x27user_save\x27");
const chunk = c.substring(idx-30, idx+220);
fs.writeFileSync("user_save_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
