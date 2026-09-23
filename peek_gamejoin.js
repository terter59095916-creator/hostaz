const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server-kiraye\\game_v2\\preloader_new.js", "utf8");
const idx = c.indexOf("_recv_game_join(obj) {");
console.log(JSON.stringify(c.substring(idx, idx + 1500)));
