const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "oldRoom.players.delete(oldWs);\r\n              broadcastToRoom(oldRoom, oldWs, { type: \x27game_leave\x27, user: { id: myId } });";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "oldRoom.players.delete(oldWs);\r\n              if (oldRoom.stickedGifts) oldRoom.stickedGifts.delete(myId);\r\n              broadcastToRoom(oldRoom, oldWs, { type: \x27game_leave\x27, user: { id: myId } });";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
