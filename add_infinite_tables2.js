const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const targetRoomId = Number(msg.room_id);\n        const targetRoom = rooms.get(targetRoomId);\n        if (targetRoom && targetRoom.players.size < MAX_SEATS) {";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const targetRoomId = Number(msg.room_id);\n        let targetRoom = rooms.get(targetRoomId);\n        if (!targetRoom && targetRoomId > 0) {\n          targetRoom = { gameId: targetRoomId, players: new Map(), stickedGifts: new Map() };\n          rooms.set(targetRoomId, targetRoom);\n          if (targetRoomId >= nextGameId) nextGameId = targetRoomId + 1;\n          console.log(\x27WS: yeni masa avtomatik yaradildi - masa=\x27 + targetRoomId);\n        }\n        if (targetRoom && targetRoom.players.size < MAX_SEATS) {";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
