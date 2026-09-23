const fs = require("fs");
const path = "C:\\bottle-server\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "wss.on('connection', (ws, req) => {\r\n  ws.isAlive = true;";
console.log("Found1:", c.includes(old1));
const new1 = "wss.on('connection', (ws, req) => {\r\n  ws.isAlive = true;\r\n  try {\r\n    const alHeader = String(req.headers['accept-language'] || '');\r\n    const firstLang = alHeader.split(',')[0].split(';')[0].split('-')[0].toLowerCase().trim();\r\n    ws.detectedLang = firstLang || 'az';\r\n  } catch (e) { ws.detectedLang = 'az'; }";
c = c.replace(old1, new1);

const old2 = "const targetLang = msg.lang || 'az';";
console.log("Found2:", c.includes(old2));
const new2 = "const targetLang = ws.detectedLang || msg.lang || 'az';";
c = c.replace(old2, new2);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
