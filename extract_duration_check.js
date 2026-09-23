const fs = require("fs");
const c = fs.readFileSync("game_v2/preloader_new.js", "utf8");
const idx = c.indexOf("if (this.player.getDuration() === 0) {");
const chunk = c.substring(idx-10, idx+250);
fs.writeFileSync("duration_check_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
