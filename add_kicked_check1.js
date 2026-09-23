const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "existingParticipants = [];\r\n      myRoom.players.forEach(p => existingParticipants.push(p));\r\n      myRoom.players.set(ws, myPlayer);";
if (c.includes(old1)) {
  const rep1 = "existingParticipants = [];\r\n      myRoom.players.forEach(p => existingParticipants.push(p));\r\n      if (wsUser && isKickedFromRoom(wsUser.id, myRoom.gameId)) {\r\n        ws.send(encodeMessage({ type: \x27kickout_info\x27, kickout_ts: wsUser.kicked_until, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\r\n      } else {\r\n      myRoom.players.set(ws, myPlayer);";
  c = c.replace(old1, rep1);
  count++;
}

fs.writeFileSync(path, c, "utf8");
console.log("Deyisdirilenler: " + count + "/1 (basqa 3-u ayri script ile edecem)");
