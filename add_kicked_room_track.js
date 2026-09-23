const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const rejoinUntilMs = Date.now() + 15 * 60 * 1000;\r\n      db.prepare(\x27UPDATE users SET kicked_until = ? WHERE id = ?\x27).run(new Date(rejoinUntilMs).toISOString(), targetIdKO);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const rejoinUntilMs = Date.now() + 15 * 60 * 1000;\r\n      db.prepare(\x27UPDATE users SET kicked_until = ?, kicked_from_game_id = ? WHERE id = ?\x27).run(new Date(rejoinUntilMs).toISOString(), room.gameId, targetIdKO);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
