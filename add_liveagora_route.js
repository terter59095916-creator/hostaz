const fs = require("fs");
const path = "C:\\bottle-server\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const idx = c.indexOf("app.get('/live-v2', (req, res) => {");
const endOfBlock = c.indexOf("});", idx) + 3;
const oldBlock = c.substring(idx, endOfBlock);
console.log("Old block:", JSON.stringify(oldBlock));

const newBlock = oldBlock + "\r\napp.get('/live-agora', (req, res) => {\r\n    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');\r\n    res.sendFile(path.join(__dirname, 'live_agora.html'));\r\n});";
c = c.replace(oldBlock, newBlock);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
