const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server-kiraye\\server.js", "utf8");
const idx = c.indexOf("ws.on('close', () => {");
console.log(JSON.stringify(c.substring(idx, idx + 350)));
