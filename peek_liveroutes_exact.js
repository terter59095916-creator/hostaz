const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server-kiraye\\server.js", "utf8");
const idx = c.indexOf("app.get('/live-v2'");
console.log(JSON.stringify(c.substring(idx, idx + 170)));
const idx2 = c.indexOf("app.get('/live', (req");
console.log(JSON.stringify(c.substring(idx2, idx2 + 170)));
