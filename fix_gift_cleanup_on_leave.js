const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "function removePlayerFromRoom(room, ws) {\r\n  if (!room || !room.players.has(ws)) return;\r\n  const leftPlayer = room.players.get(ws);\r\n  room.players.delete(ws);\r\n  broadcastToRoom(room, ws, { type: \x27game_leave\x27, user: leftPlayer });\r\n}";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "function removePlayerFromRoom(room, ws) {\r\n  if (!room || !room.players.has(ws)) return;\r\n  const leftPlayer = room.players.get(ws);\r\n  room.players.delete(ws);\r\n  if (leftPlayer && leftPlayer.id && room.stickedGifts) room.stickedGifts.delete(leftPlayer.id);\r\n  broadcastToRoom(room, ws, { type: \x27game_leave\x27, user: leftPlayer });\r\n}";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
