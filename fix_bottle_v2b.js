const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "} else if (msg.type === \x27league_info\x27) {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const insertion = "} else if (msg.type === \x27game_turn\x27 && msg.packet === undefined) {\n        if (ws.gameRoom && ws.gameRoom.pendingSpin && ws.gameRoom.pendingSpin.active && wsUser && String(ws.gameRoom.pendingSpin.active.p.id) === String(wsUser.id)) {\n          if (ws.gameRoom.bottleTimer) {\n            clearTimeout(ws.gameRoom.bottleTimer);\n            ws.gameRoom.bottleTimer = null;\n          }\n          if (ws.gameRoom.finishSpin) {\n            ws.gameRoom.finishSpin();\n            console.log(\x27WS: butulka (v2) klikle firlandi - \x27 + wsUser.username);\n          }\n          if (Math.random() < 0.1) {\n            db.prepare(\x27UPDATE users SET coins = coins + 1 WHERE id = ?\x27).run(wsUser.id);\n            ws.send(encodeMessage({ packet: ws.packetCounter++, type: \x27game_lucky_gold\x27, amount: 1, user: { id: String(wsUser.id), name: wsUser.username } }));\n            console.log(\x27WS: sansli qizil (v2) verildi - \x27 + wsUser.username);\n          }\n        }\n      } else if (msg.type === \x27league_info\x27) {";
  c = c.substring(0, idx) + insertion + c.substring(idx + marker.length);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
