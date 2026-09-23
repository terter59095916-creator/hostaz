const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const bad = "if (wsUser && isKickedFromRoom(wsUser.id, myRoom.gameId)) {\r\n        ws.send(encodeMessage({ type: \x27kickout_info\x27, kickout_ts: wsUser.kicked_until, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\r\n      } else {\r\n      myRoom.players.set(ws, myPlayer);";
const idx = c.indexOf(bad);
console.log("Tapildi (bad):", idx !== -1);
if (idx !== -1) {
  const fixed = "if (wsUser && isKickedFromRoom(wsUser.id, myRoom.gameId)) {\r\n        ws.send(encodeMessage({ type: \x27kickout_info\x27, kickout_ts: wsUser.kicked_until, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\r\n        return;\r\n      }\r\n      myRoom.players.set(ws, myPlayer);";
  c = c.replace(bad, fixed);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
