const fs = require("fs");
const c = fs.readFileSync("game_v2/preloader_new.js", "utf8");
const idx = c.indexOf("goruntulenebilir");
const chunk = c.substring(Math.max(0,idx-400), idx+50);
fs.writeFileSync("domain_guard_check.txt", JSON.stringify(chunk));
console.log("saved");
