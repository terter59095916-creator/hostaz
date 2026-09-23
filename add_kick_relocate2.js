const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (targetWsKO.gameRoom) removePlayerFromRoom(targetWsKO.gameRoom, targetWsKO);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (targetWsKO.gameRoom) removePlayerFromRoom(targetWsKO.gameRoom, targetWsKO);\n      let moveNewRoom = null;\n      for (const r of rooms.values()) { if (r.gameId !== room.gameId && r.players.size < MAX_SEATS) { moveNewRoom = r; break; } }\n      if (!moveNewRoom) moveNewRoom = createRoom();\n      const moveSeat = getNextSeatInRoom(moveNewRoom);\n      const movedPlayer = targetPlayerKO ? Object.assign({}, targetPlayerKO, { seat: moveSeat }) : null;\n      if (movedPlayer) {\n        const moveExisting = [];\n        moveNewRoom.players.forEach(p => moveExisting.push(p));\n        moveNewRoom.players.set(targetWsKO, movedPlayer);\n        targetWsKO.gameRoom = moveNewRoom;\n        targetWsKO.gamePlayer = movedPlayer;\n        targetWsKO.send(encodeMessage({\n          type: 'game_enter',\n          packet: targetWsKO.packetCounter=(targetWsKO.packetCounter||1000)+1,\n          game_id: moveNewRoom.gameId,\n          bottle_type: moveNewRoom.bottleType || 'vipbottle',\n          participants: [movedPlayer, ...moveExisting],\n          abtest: { kickout: true },\n          kickout_info: { price: 0, refresh_ms: 60000 }\n        }));\n        broadcastToRoom(moveNewRoom, targetWsKO, { type: 'game_join', user: movedPlayer });\n        startBottleTurn(moveNewRoom);\n      }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
