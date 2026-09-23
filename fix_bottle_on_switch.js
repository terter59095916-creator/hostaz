const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const old1 = "broadcastToRoom(newRoom, ws, { type: 'game_join', user: rejoinedPlayer });";
const idx1 = c.indexOf(old1);
console.log("goto_random tapildi:", idx1 !== -1);
if (idx1 !== -1) {
  c = c.replace(old1, old1 + "\r\n          startBottleTurn(newRoom);");
}

const old2 = "broadcastToRoom(destRoom, ws, { type: 'game_join', user: rejoinedPlayer2 });";
const idx2 = c.indexOf(old2);
console.log("goto_user tapildi:", idx2 !== -1);
if (idx2 !== -1) {
  c = c.replace(old2, old2 + "\r\n            startBottleTurn(destRoom);");
}

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
