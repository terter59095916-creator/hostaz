const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (pending) {\n      const saverCrystalsRow = db.prepare(\x27SELECT crystals FROM users WHERE id = ?\x27).get(wsUser.id);\n      if (!saverCrystalsRow || (saverCrystalsRow.crystals || 0) < 100) {\n        ws.send(encodeMessage({ type: \x27live_error\x27, reason: \x27insufficient_crystals\x27, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\n        return;\n      }\n      db.prepare(\x27UPDATE users SET crystals = crystals - 100 WHERE id = ?\x27).run(wsUser.id);\n    }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (pending) {\n      if (!Boolean(wsUser.is_vip)) {\n        ws.send(encodeMessage({ type: \x27live_error\x27, reason: \x27vip_required\x27, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\n        return;\n      }\n      const saverCoinsRow = db.prepare(\x27SELECT coins FROM users WHERE id = ?\x27).get(wsUser.id);\n      if (!saverCoinsRow || (saverCoinsRow.coins || 0) < 100) {\n        ws.send(encodeMessage({ type: \x27live_error\x27, reason: \x27insufficient_coins\x27, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\n        return;\n      }\n      db.prepare(\x27UPDATE users SET coins = coins - 100 WHERE id = ?\x27).run(wsUser.id);\n    }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
