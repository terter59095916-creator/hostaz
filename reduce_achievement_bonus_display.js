const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const bonusAmount = (newLevel + 1) * 50;";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const bonusAmount = (newLevel + 1) * 5;";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
