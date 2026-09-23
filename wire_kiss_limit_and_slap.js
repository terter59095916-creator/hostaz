const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (wsUser) { const leagueMult = ws.leagueKiss2xActive ? 2 : 1; ws.leagueKiss2xActive = false; addDailyLeagueScore(wsUser.id, leagueMult); }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (wsUser) { const leagueMult = ws.leagueKiss2xActive ? 2 : 1; ws.leagueKiss2xActive = false; addKissLeagueScore(wsUser.id, leagueMult); if (ws.refuseSlapActive) { ws.refuseSlapActive = false; addKissLeagueScore(wsUser.id, 1); } }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
