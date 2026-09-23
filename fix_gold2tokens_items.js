const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "items: [\n            { gold: 10, tokens: 5 },\n            { gold: 50, tokens: 30 },\n            { gold: 100, tokens: 70 }\n          ]";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "items: [\n            { gold: 3, tokens: 3 },\n            { gold: 5, tokens: 10 },\n            { gold: 10, tokens: 25 },\n            { gold: 30, tokens: 75 },\n            { gold: 180, tokens: 450 }\n          ]";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
} else {
  console.log("Movcud metn tapilmadi, avtomatik axtaris...");
  const idx2 = c.indexOf("{ gold: 10, tokens: 5 }");
  console.log("idx2=" + idx2);
  if (idx2 !== -1) console.log(JSON.stringify(c.substring(idx2-50, idx2+150)));
}
