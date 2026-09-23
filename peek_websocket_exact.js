const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server-kiraye\\game_v2\\preloader_new.js", "utf8");
const idx = c.indexOf("window.location.hostname");
console.log(JSON.stringify(c.substring(idx - 60, idx + 40)));
