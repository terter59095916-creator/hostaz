const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const old1 = "if (msg.item === \x27league_kiss2x\x27) ws.leagueKiss2xActive = true;";
const idx1 = c.indexOf(old1);
console.log("aktivasiya tapildi:", idx1 !== -1);
if (idx1 !== -1) {
  const rep1 = "if (msg.item === \x27league_kiss2x\x27) ws.leagueKiss2xExpiresAt = Date.now() + 5 * 60 * 1000;";
  c = c.replace(old1, rep1);
}

const old2 = "if (wsUser) { const leagueMult = ws.leagueKiss2xActive ? 2 : 1; ws.leagueKiss2xActive = false; addKissLeagueScore(wsUser.id, leagueMult); }";
const idx2 = c.indexOf(old2);
console.log("isteme tapildi:", idx2 !== -1);
if (idx2 !== -1) {
  const rep2 = "if (wsUser) { const leagueMult = (ws.leagueKiss2xExpiresAt && Date.now() < ws.leagueKiss2xExpiresAt) ? 2 : 1; addKissLeagueScore(wsUser.id, leagueMult); }";
  c = c.replace(old2, rep2);
}

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
