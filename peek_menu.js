const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\game_v2\\preloader_new.js", "utf8");
const idx = c.indexOf("class MiscMenuDialog extends Dialog {");
console.log(JSON.stringify(c.substring(idx, idx + 2500)));
