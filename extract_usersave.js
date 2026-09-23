const fs = require("fs");
const c = fs.readFileSync("game_v2/preloader_new.js", "utf8");
const idx = c.indexOf("userSave(user_id, save_referrer) {");
const chunk = c.substring(idx, idx+300);
fs.writeFileSync("usersave_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
