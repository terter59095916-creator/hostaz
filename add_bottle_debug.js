const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "  const hasMale = players.some(x => x.p.male);\r\n  const hasFemale = players.some(x => !x.p.male);\r\n  if (!hasMale || !hasFemale) return;";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "  const hasMale = players.some(x => x.p.male);\r\n  const hasFemale = players.some(x => !x.p.male);\r\n  console.log(\x27BOTTLE-DEBUG: masa=\x27 + room.gameId + \x27 oyuncular=\x27 + JSON.stringify(players.map(x => ({id: x.p.id, name: x.p.name, male: x.p.male}))) + \x27 hasMale=\x27 + hasMale + \x27 hasFemale=\x27 + hasFemale);\r\n  if (!hasMale || !hasFemale) { console.log(\x27BOTTLE-DEBUG: masa=\x27 + room.gameId + \x27 - DAYANDI, iki cins yoxdur\x27); return; }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
