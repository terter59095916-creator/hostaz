const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\server.js", "utf8");
const idx = c.indexOf("} else if (msg.type === 'translate') {");
console.log(JSON.stringify(c.substring(idx, idx + 1400)));
