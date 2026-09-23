const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\game_v2\\preloader_new.js", "utf8");
const idx = c.indexOf("onTranslate: ts &&");
console.log("idx:", idx);
console.log(JSON.stringify(c.substring(idx, idx + 150)));
