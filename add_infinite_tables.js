const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const targetRoomId = Number(msg.room_id);\r\n        const targetRoom = rooms.get(targetRoomId);\r\n        if (targetRoom && targetRoom.players.size < MAX_SEATS) {";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const targetRoomId = Number(msg.room_id);\r\n        let targetRoom = rooms.get(targetRoomId);\r\n        if (!targetRoom && targetRoomId > 0) {\r\n          targetRoom = { gameId: targetRoomId, players: new Map(), stickedGifts: new Map() };\r\n          rooms.set(targetRoomId, targetRoom);\r\n          if (targetRoomId >= nextGameId) nextGameId = targetRoomId + 1;\r\n          console.log(\x27WS: yeni masa avtomatik yaradildi - masa=\x27 + targetRoomId);\r\n        }\r\n        if (targetRoom && targetRoom.players.size < MAX_SEATS) {";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
