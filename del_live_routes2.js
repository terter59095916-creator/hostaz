const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "app.get('/live-v2', (req, res) => {\n    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');\n    res.sendFile(path.join(__dirname, 'live_v2.html'));\n});\n";
console.log("Found route1 (/live-v2):", c.includes(old1));
c = c.replace(old1, "");

const old2 = "app.get('/live', (req, res) => {\n    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');\n    res.sendFile(path.join(__dirname, 'live_v2.html'));\n});\n";
console.log("Found route2 (/live):", c.includes(old2));
c = c.replace(old2, "");

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
