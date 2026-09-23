const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "type: \x27user_save\x27,\n      saviour_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== \x27female\x27 },\n      saved_user: { id: String(targetIdSave), name: savedPlayer ? savedPlayer.name : \x27\x27, male: savedPlayer ? savedPlayer.male : true },\n      kickout_info: { price: 50 }\n    });";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "type: \x27user_save\x27,\n      saviour_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== \x27female\x27 },\n      saved_user: { id: String(targetIdSave), name: savedPlayer ? savedPlayer.name : \x27\x27, male: savedPlayer ? savedPlayer.male : true },\n      kickout_info: { price: 50 }\n    });\n    broadcastToRoom(ws.gameRoom, null, {\n      type: \x27game_chat\x27,\n      body: \x27\\uD83D\\uDC8E \x27 + (wsUser.display_name || wsUser.username) + (Number(wsUser.id) === targetIdSave ? \x27 kristal \x27 + 100 + \x27 \\u00f6d\u0259yib masada qald\u0131!\x27 : \x27 \x27 + (savedPlayer ? savedPlayer.name : \x27\x27) + \x27-ni xilas etdi!\x27),\n      text: \x27\\uD83D\\uDC8E \x27 + (wsUser.display_name || wsUser.username) + (Number(wsUser.id) === targetIdSave ? \x27 kristal \x27 + 100 + \x27 \\u00f6d\u0259yib masada qald\u0131!\x27 : \x27 \x27 + (savedPlayer ? savedPlayer.name : \x27\x27) + \x27-ni xilas etdi!\x27),\n      receiver_id: \x27\x27, receiver_name: \x27\x27,\n      user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== \x27female\x27, photo_url: wsUser.avatar_data ? (\x27/api/avatar/\x27 + wsUser.id) : \x27\x27 }\n    });";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
