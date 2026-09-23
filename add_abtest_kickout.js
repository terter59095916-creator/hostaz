const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "type: \x27game_enter\x27,\r\n        packet: ws.packetCounter++,\r\n        game_id: myRoom.gameId,\r\n        bottle_type: myRoom.bottleType || \x27vipbottle\x27,\r\n        participants: [myPlayer, ...existingParticipants]\r\n      };";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "type: \x27game_enter\x27,\r\n        packet: ws.packetCounter++,\r\n        game_id: myRoom.gameId,\r\n        bottle_type: myRoom.bottleType || \x27vipbottle\x27,\r\n        participants: [myPlayer, ...existingParticipants],\r\n        abtest: { kickout: true }\r\n      };";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
