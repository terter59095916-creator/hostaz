const fs = require("fs");
let c = fs.readFileSync("server.js", "utf8");
const newBlock = fs.readFileSync("new_live_block.txt", "utf8");
const startIdx = c.indexOf("} else if (msg.type === \x27start_live\x27) {");
const endIdx = c.indexOf("} else if (msg.type === \x27goto_user\x27) {");
console.log("startIdx:", startIdx, "endIdx:", endIdx);
if (startIdx === -1 || endIdx === -1) { console.log("MARKER TAPILMADI"); process.exit(1); }
c = c.slice(0, startIdx) + newBlock + c.slice(endIdx);
fs.writeFileSync("server.js", c, "utf8");
console.log("YAZILDI, yeni uzunluq=" + c.length);
