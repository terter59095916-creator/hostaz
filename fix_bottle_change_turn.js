const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (msg.type === \x27game_bottle\x27 && ws.gameRoom) {\r\n          if (msg.bottle_type) {\r\n            ws.gameRoom.bottleType = msg.bottle_type;\r\n            console.log(\x27WS: masanin sise tipi deyisdirildi - masa=\x27 + ws.gameRoom.gameId + \x27 - \x27 + msg.bottle_type);\r\n          }\r\n          if (ws.gameRoom.bottleTimer) { clearTimeout(ws.gameRoom.bottleTimer); ws.gameRoom.bottleTimer = null; }\r\n          startBottleTurn(ws.gameRoom);\r\n        }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (msg.type === \x27game_bottle\x27 && ws.gameRoom) {\r\n          if (msg.bottle_type) {\r\n            ws.gameRoom.bottleType = msg.bottle_type;\r\n            console.log(\x27WS: masanin sise tipi deyisdirildi - masa=\x27 + ws.gameRoom.gameId + \x27 - \x27 + msg.bottle_type);\r\n            broadcastToRoom(ws.gameRoom, null, { type: \x27game_bottle\x27, bottle_type: msg.bottle_type });\r\n          }\r\n          if (!ws.gameRoom.pendingSpin && !ws.gameRoom.bottleTimer) {\r\n            startBottleTurn(ws.gameRoom);\r\n          }\r\n        }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
