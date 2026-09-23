const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "addDailyLeagueScore(Number(receiverPlayer2.id), 1);\r\n            if (wsUser) addDailyLeagueScore(wsUser.id, 1);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "addDailyLeagueScore(Number(receiverPlayer2.id), 1);\r\n            if (wsUser) { const leagueMult = ws.leagueKiss2xActive ? 2 : 1; ws.leagueKiss2xActive = false; addDailyLeagueScore(wsUser.id, leagueMult); }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
