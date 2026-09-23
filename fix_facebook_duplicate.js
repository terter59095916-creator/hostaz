const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const info = if (device_id) {";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  c = c.replace(old, "if (device_id) {");
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
