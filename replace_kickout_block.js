const fs = require("fs");
let c = fs.readFileSync("server.js", "utf8");
const newBlock = fs.readFileSync("kickout_block_v2.txt", "utf8");
const startIdx = c.indexOf("} else if (msg.type === \x27kickout_start\x27) {");
const endIdx = c.indexOf("} else if (msg.type === \x27goto_user\x27) {");
console.log("startIdx:", startIdx, "endIdx:", endIdx);
if (startIdx !== -1 && endIdx !== -1) {
  c = c.slice(0, startIdx) + newBlock + c.slice(endIdx);
  fs.writeFileSync("server.js", c, "utf8");
  console.log("YAZILDI");
}
