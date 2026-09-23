const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server-kiraye\\game_v2\\preloader_new.js", "utf8");
console.log(JSON.stringify(c.substring(7034800, 7035400)));
