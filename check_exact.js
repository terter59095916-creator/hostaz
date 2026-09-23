const c = require("fs").readFileSync("game_v2/preloader_new.js", "utf8");
const idx = c.indexOf("scheduledGifts.find");
console.log(JSON.stringify(c.substring(idx-15, idx+180)));
