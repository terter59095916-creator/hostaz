const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "type: \x27user_kicked\x27,\n        kicker_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== \x27female\x27 },\n        kicked_user: { id: String(targetIdKO), name: targetPlayerKO.name, male: targetPlayerKO.male },\n        unkick_ts: rejoinUntilMs,\n        game_id: room.gameId\n      });";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "type: \x27user_kicked\x27,\n        kicker_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== \x27female\x27 },\n        kicked_user: { id: String(targetIdKO), name: targetPlayerKO.name, male: targetPlayerKO.male },\n        unkick_ts: rejoinUntilMs,\n        game_id: room.gameId\n      });\n      broadcastToRoom(room, null, {\n        type: \x27game_chat\x27,\n        body: \x27\\u26D4 \x27 + (wsUser.display_name || wsUser.username) + \x27, \x27 + targetPlayerKO.name + \x27 istifadecisini masadan qovdu!\x27,\n        text: \x27\\u26D4 \x27 + (wsUser.display_name || wsUser.username) + \x27, \x27 + targetPlayerKO.name + \x27 istifadecisini masadan qovdu!\x27,\n        receiver_id: \x27\x27, receiver_name: \x27\x27,\n        user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== \x27female\x27, photo_url: wsUser.avatar_data ? (\x27/api/avatar/\x27 + wsUser.id) : \x27\x27 }\n      });";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
