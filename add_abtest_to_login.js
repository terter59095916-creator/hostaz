const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const loginResponse = {\r\n        type: \x27login\x27,\r\n        packet: ws.packetCounter++,";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const loginResponse = {\r\n        type: \x27login\x27,\r\n        packet: ws.packetCounter++,\r\n        abtest: { kickout: true },";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
