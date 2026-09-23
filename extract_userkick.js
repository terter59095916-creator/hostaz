const fs = require("fs");
const c = fs.readFileSync("game_v2/preloader_new.js", "utf8");
const idx = c.indexOf("userKick(user_id) {");
const chunk = c.substring(idx, idx+700);
fs.writeFileSync("userkick_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
