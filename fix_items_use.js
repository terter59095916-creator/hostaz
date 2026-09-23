const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (ownedKF.kiss_fire && ownedKF.kiss_fire > 0) {\n            ownedKF.kiss_fire -= 1;\n            db.prepare(\x27UPDATE users SET owned_items = ? WHERE id = ?\x27).run(JSON.stringify(ownedKF), wsUser.id);\n            ws.kissFireActive = true;\n            console.log(\x27WS: kiss_fire istifade edildi - \x27 + wsUser.username + \x27 - qalan=\x27 + ownedKF.kiss_fire);\n          }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (ownedKF[msg.item] && ownedKF[msg.item] > 0) {\n            ownedKF[msg.item] -= 1;\n            db.prepare(\x27UPDATE users SET owned_items = ? WHERE id = ?\x27).run(JSON.stringify(ownedKF), wsUser.id);\n            if (msg.item === \x27kiss_fire\x27) ws.kissFireActive = true;\n            if (msg.item === \x27league_kiss2x\x27) ws.leagueKiss2xActive = true;\n            if (msg.item === \x27league_kiss_lim10\x27) addDailyLeagueScore(wsUser.id, 10);\n            if (msg.item === \x27league5\x27) addDailyLeagueScore(wsUser.id, 5);\n            console.log(\x27WS: \x27 + msg.item + \x27 istifade edildi - \x27 + wsUser.username + \x27 - qalan=\x27 + ownedKF[msg.item]);\n          }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
