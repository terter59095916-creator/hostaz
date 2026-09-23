const fs = require("fs");
let c = fs.readFileSync("server.js", "utf8");
const koBlock = fs.readFileSync("kickout_block.txt", "utf8");
const marker = "} else if (msg.type === \x27goto_user\x27) {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  c = c.slice(0, idx) + koBlock + c.slice(idx);
  fs.writeFileSync("server.js", c, "utf8");
  console.log("YAZILDI");
}
