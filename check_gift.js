const fs = require("fs");
const c = fs.readFileSync("game_v2/preloader_new.js", "utf8");
const idx = c.indexOf("case \x27gift\x27:");
console.log(JSON.stringify(c.substring(idx, idx+180)));
