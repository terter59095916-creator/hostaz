const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server-kiraye\\game_v2\\preloader_new.js", "utf8");
const idx = c.indexOf("function iterData");
console.log(JSON.stringify(c.substring(idx, idx + 700)));
