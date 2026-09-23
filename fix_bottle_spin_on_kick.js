const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "function removePlayerFromRoom(room, ws) {\n  if (!room || !room.players.has(ws)) return;\n  const leftPlayer = room.players.get(ws);\n  room.players.delete(ws);\n  if (leftPlayer && leftPlayer.id && room.stickedGifts) room.stickedGifts.delete(leftPlayer.id);\n  broadcastToRoom(room, ws, { type: \x27game_leave\x27, user: leftPlayer });\n}";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "function removePlayerFromRoom(room, ws) {\n  if (!room || !room.players.has(ws)) return;\n  const leftPlayer = room.players.get(ws);\n  room.players.delete(ws);\n  if (leftPlayer && leftPlayer.id && room.stickedGifts) room.stickedGifts.delete(leftPlayer.id);\n  broadcastToRoom(room, ws, { type: \x27game_leave\x27, user: leftPlayer });\n  if (room.pendingSpin) {\n    const wasInvolved = room.pendingSpin.players.some(x => x.p.id === leftPlayer.id);\n    if (wasInvolved) {\n      if (room.bottleTimer) { clearTimeout(room.bottleTimer); room.bottleTimer = null; }\n      room.pendingSpin = null;\n      console.log(\x27BOTTLE-DEBUG: masa=\x27 + room.gameId + \x27 - fırlanma legv edildi, oyunçu ayrildi=\x27 + leftPlayer.id);\n      setTimeout(() => startBottleTurn(room), 500);\n    }\n  }\n}";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
