const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "items: [\n            { gold: 10, tokens: 5 },\n            { gold: 50, tokens: 30 },\n            { gold: 100, tokens: 70 }\n          ]";
if (c.includes(old1)) {
  c = c.split(old1).join("items: [\n            { gold: 3, tokens: 3 },\n            { gold: 5, tokens: 10 },\n            { gold: 10, tokens: 25 },\n            { gold: 30, tokens: 75 },\n            { gold: 180, tokens: 450 }\n          ]");
  count++;
}

const old2 = "const rate = { 10: 5, 50: 30, 100: 70 };";
if (c.includes(old2)) {
  c = c.split(old2).join("const rate = { 3: 3, 5: 10, 10: 25, 30: 75, 180: 450 };");
  count++;
}

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
