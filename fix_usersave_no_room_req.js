const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = fs.readFileSync("full_usersave_output.txt", "utf8");
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "} else if (msg.type === \x27user_save\x27) {\n    if (!wsUser) return;\n    const targetIdSave = Number(msg.user_id);\n    let saveRoom = null;\n    let pending = null;\n    for (const r of rooms.values()) {\n      if (r.pendingKickouts && r.pendingKickouts.has(targetIdSave)) { saveRoom = r; pending = r.pendingKickouts.get(targetIdSave); break; }\n    }\n    if (pending) {\n      if (!Boolean(wsUser.is_vip)) {\n        ws.send(encodeMessage({ type: \x27live_error\x27, reason: \x27vip_required\x27, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\n        return;\n      }\n      const saverCoinsRow = db.prepare(\x27SELECT coins FROM users WHERE id = ?\x27).get(wsUser.id);\n      if (!saverCoinsRow || (saverCoinsRow.coins || 0) < 100) {\n        ws.send(encodeMessage({ type: \x27live_error\x27, reason: \x27insufficient_coins\x27, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));\n        return;\n      }\n      db.prepare(\x27UPDATE users SET coins = coins - 100 WHERE id = ?\x27).run(wsUser.id);\n    }\n    if (!pending || !saveRoom) return;\n    clearTimeout(pending.timeoutHandle);\n    saveRoom.pendingKickouts.delete(targetIdSave);\n    let savedPlayer = null;\n    saveRoom.players.forEach((p) => { if (Number(p.id) === targetIdSave) savedPlayer = p; });\n    broadcastToRoom(saveRoom, null, {\n      type: \x27user_save\x27,\n      saviour_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== \x27female\x27, photo_url: wsUser.avatar_data ? (\x27/api/avatar/\x27 + wsUser.id) : \x27\x27 },\n      saved_user: { id: String(targetIdSave), name: savedPlayer ? savedPlayer.name : \x27\x27, male: savedPlayer ? savedPlayer.male : true, photo_url: savedPlayer ? (savedPlayer.photo_url || \x27\x27) : \x27\x27 },\n      kickout_info: { price: 60 }\n    });\n    console.log(\x27WS: kickout xilas edildi - saver=\x27 + wsUser.username + \x27 target=\x27 + targetIdSave);\n";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
