const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old2 = "const others = [];\r\n          newRoom.players.forEach(p => others.push(p));\r\n          newRoom.players.set(ws, rejoinedPlayer);";
if (c.includes(old2)) {
  const rep2 = "const others = [];\r\n          newRoom.players.forEach(p => others.push(p));\r\n          if (wsUser && isKickedFromRoom(wsUser.id, newRoom.gameId)) {\r\n            ws.send(encodeMessage({ type: \x27kickout_info\x27, kickout_ts: wsUser.kicked_until, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\r\n            return;\r\n          }\r\n          newRoom.players.set(ws, rejoinedPlayer);";
  c = c.replace(old2, rep2);
  count++;
}

const old3 = "const othersX = [];\n            targetRoom.players.forEach(p => othersX.push(p));\n            targetRoom.players.set(ws, rejoinedPlayerX);";
if (c.includes(old3)) {
  const rep3 = "const othersX = [];\n            targetRoom.players.forEach(p => othersX.push(p));\n            if (wsUser && isKickedFromRoom(wsUser.id, targetRoom.gameId)) {\n              ws.send(encodeMessage({ type: \x27kickout_info\x27, kickout_ts: wsUser.kicked_until, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\n              return;\n            }\n            targetRoom.players.set(ws, rejoinedPlayerX);";
  c = c.replace(old3, rep3);
  count++;
}

const old4 = "const others2 = [];\r\n            destRoom.players.forEach(p => others2.push(p));\r\n            destRoom.players.set(ws, rejoinedPlayer2);";
if (c.includes(old4)) {
  const rep4 = "const others2 = [];\r\n            destRoom.players.forEach(p => others2.push(p));\r\n            if (wsUser && isKickedFromRoom(wsUser.id, destRoom.gameId)) {\r\n              ws.send(encodeMessage({ type: \x27kickout_info\x27, kickout_ts: wsUser.kicked_until, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\r\n              return;\r\n            }\r\n            destRoom.players.set(ws, rejoinedPlayer2);";
  c = c.replace(old4, rep4);
  count++;
}

console.log("Deyisdirilenler: " + count + "/3");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
