const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "} else if (msg.type === \x27user_save\x27) {\n    if (!wsUser || !ws.gameRoom || !ws.gameRoom.pendingKickouts) return;\n    const targetIdSave = Number(msg.user_id);\n    const pending = ws.gameRoom.pendingKickouts.get(targetIdSave);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "} else if (msg.type === \x27user_save\x27) {\n    if (!wsUser || !ws.gameRoom || !ws.gameRoom.pendingKickouts) return;\n    const targetIdSave = Number(msg.user_id);\n    const pending = ws.gameRoom.pendingKickouts.get(targetIdSave);\n    if (pending) {\n      const saverCrystalsRow = db.prepare(\x27SELECT crystals FROM users WHERE id = ?\x27).get(wsUser.id);\n      if (!saverCrystalsRow || (saverCrystalsRow.crystals || 0) < 100) {\n        ws.send(encodeMessage({ type: \x27live_error\x27, reason: \x27insufficient_crystals\x27, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\n        return;\n      }\n      db.prepare(\x27UPDATE users SET crystals = crystals - 100 WHERE id = ?\x27).run(wsUser.id);\n    }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
