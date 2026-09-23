const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "items: [\r\n            { gold: 10, tokens: 5 },\r\n            { gold: 50, tokens: 30 },\r\n            { gold: 100, tokens: 70 }\r\n          ]";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "items: [\r\n            { gold: 3, tokens: 3 },\r\n            { gold: 5, tokens: 10 },\r\n            { gold: 10, tokens: 25 },\r\n            { gold: 30, tokens: 75 },\r\n            { gold: 180, tokens: 450 }\r\n          ]";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
