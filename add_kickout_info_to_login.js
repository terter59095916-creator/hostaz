const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "abtest: { kickout: true },";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "abtest: { kickout: true },\r\n        kickout_info: { price: 50, refresh_ms: 60000 },";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
