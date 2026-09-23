const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "function addDailyLeagueScore(userId, amount) {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const helper = "function isKickedFromRoom(userId, gameId) {\r\n  const row = db.prepare(\x27SELECT kicked_until, kicked_from_game_id FROM users WHERE id = ?\x27).get(userId);\r\n  if (!row || !row.kicked_until) return false;\r\n  if (Number(row.kicked_from_game_id) !== Number(gameId)) return false;\r\n  return new Date(row.kicked_until) > new Date();\r\n}\r\n" + marker;
  c = c.replace(marker, helper);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
