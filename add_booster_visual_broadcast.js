const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (wsUser) { const leagueMult = ws.leagueKiss2xActive ? 2 : 1; ws.leagueKiss2xActive = false; addKissLeagueScore(wsUser.id, leagueMult); if (ws.refuseSlapActive) { ws.refuseSlapActive = false; addKissLeagueScore(wsUser.id, 1); } }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (kissFireMultiplier === 2) {\r\n              broadcastToRoom(ws.gameRoom, null, { type: \x27game_turn_booster\x27, user_id: String(wsUser ? wsUser.id : \x27\x27), receiver_id: String(receiverPlayer2.id), booster: \x27kiss_fire\x27 });\r\n            }\r\n            if (ws.refuseSlapActive) {\r\n              broadcastToRoom(ws.gameRoom, null, { type: \x27game_turn_booster\x27, user_id: String(wsUser ? wsUser.id : \x27\x27), receiver_id: String(receiverPlayer2.id), booster: \x27refuse_slap\x27 });\r\n            }\r\n            if (wsUser) { const leagueMult = ws.leagueKiss2xActive ? 2 : 1; ws.leagueKiss2xActive = false; addKissLeagueScore(wsUser.id, leagueMult); if (ws.refuseSlapActive) { ws.refuseSlapActive = false; addKissLeagueScore(wsUser.id, 1); } }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
