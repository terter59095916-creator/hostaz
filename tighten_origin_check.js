const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (req.headers.origin && allowedOrigins.indexOf(req.headers.origin) < 0) {";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (!req.headers.origin || allowedOrigins.indexOf(req.headers.origin) < 0) {";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
