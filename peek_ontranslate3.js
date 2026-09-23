const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\game_v2\\preloader_new.js", "utf8");
const idx = c.indexOf("onTranslate:");
console.log("idx:", idx);
if (idx >= 0) console.log(JSON.stringify(c.substring(idx - 20, idx + 200)));
