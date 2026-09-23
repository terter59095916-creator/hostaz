const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "ws.send(encodeMessage(gameEnterResponse));\r\n      console.log(\x27WS SENT: game_enter response - masa: \x27 + myRoom.gameId + \x27 oyuncu sayi: \x27 + myRoom.players.size);\r\n      existingParticipants.forEach(function(fellowP) {\r\n        try { ws.send(encodeMessage({ type: \x27game_join\x27, user: fellowP, packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); } catch(e) {}\r\n      });";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "ws.send(encodeMessage(gameEnterResponse));\r\n      console.log(\x27WS SENT: game_enter response - masa: \x27 + myRoom.gameId + \x27 oyuncu sayi: \x27 + myRoom.players.size);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
