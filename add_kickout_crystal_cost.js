const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "} else if (msg.type === \x27user_kickout\x27) {\r\n    if (!wsUser || !Boolean(wsUser.is_vip) || !ws.gameRoom) return;\r\n    const targetIdKO = Number(msg.user_id);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "} else if (msg.type === \x27user_kickout\x27) {\r\n    if (!wsUser || !Boolean(wsUser.is_vip) || !ws.gameRoom) return;\r\n    if ((wsUser.crystals || 0) < 50) {\r\n      ws.send(encodeMessage({ type: \x27live_error\x27, reason: \x27insufficient_crystals\x27, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\r\n      return;\r\n    }\r\n    db.prepare(\x27UPDATE users SET crystals = crystals - 50 WHERE id = ?\x27).run(wsUser.id);\r\n    const targetIdKO = Number(msg.user_id);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
