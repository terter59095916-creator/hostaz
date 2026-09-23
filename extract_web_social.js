const fs = require("fs");
const c = fs.readFileSync("game_v2/preloader_new.js", "utf8");
const idx = c.indexOf("FALLBACK-TO-WEB-SOCIAL");
const chunk = c.substring(idx, idx+800);
fs.writeFileSync("web_social_check.txt", JSON.stringify(chunk));
console.log("saved");
