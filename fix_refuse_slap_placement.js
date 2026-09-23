const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const old1 = "if (kissFireMultiplier === 2) {\r\n              broadcastToRoom(ws.gameRoom, null, { type: \x27game_turn_booster\x27, user_id: String(wsUser ? wsUser.id : \x27\x27), receiver_id: String(receiverPlayer2.id), booster: \x27kiss_fire\x27 });\r\n            }\r\n            if (ws.refuseSlapActive) {\r\n              broadcastToRoom(ws.gameRoom, null, { type: \x27game_turn_booster\x27, user_id: String(wsUser ? wsUser.id : \x27\x27), receiver_id: String(receiverPlayer2.id), booster: \x27refuse_slap\x27 });\r\n            }\r\n            if (wsUser) { const leagueMult = ws.leagueKiss2xActive ? 2 : 1; ws.leagueKiss2xActive = false; addKissLeagueScore(wsUser.id, leagueMult); if (ws.refuseSlapActive) { ws.refuseSlapActive = false; addKissLeagueScore(wsUser.id, 1); } }";
const idx1 = c.indexOf(old1);
console.log("kiss bolumu tapildi:", idx1 !== -1);
if (idx1 !== -1) {
  const rep1 = "if (kissFireMultiplier === 2) {\r\n              broadcastToRoom(ws.gameRoom, null, { type: \x27game_turn_booster\x27, user_id: String(wsUser ? wsUser.id : \x27\x27), receiver_id: String(receiverPlayer2.id), booster: \x27kiss_fire\x27 });\r\n            }\r\n            if (wsUser) { const leagueMult = ws.leagueKiss2xActive ? 2 : 1; ws.leagueKiss2xActive = false; addKissLeagueScore(wsUser.id, leagueMult); }";
  c = c.replace(old1, rep1);
}

const old2 = "if (msg.type === \x27game_refuse\x27) {\r\n        console.log(\x27GAME-REFUSE-TAPILDI!!! wsUser=\x27 + Boolean(wsUser) + \x27 gameRoom=\x27 + Boolean(ws.gameRoom));\r\n        if (ws.gamePlayer) {\r\n          msg.user = { id: ws.gamePlayer.id, name: ws.gamePlayer.name, male: ws.gamePlayer.male, vip: ws.gamePlayer.vip, pass_premium: ws.gamePlayer.pass_premium, top: ws.gamePlayer.top, photo_url: ws.gamePlayer.photo_url };\r\n        }\r\n        if (ws.gameRoom) {\r\n          broadcastToRoom(ws.gameRoom, null, msg);\r\n          console.log(\x27GAME-REFUSE-BROADCAST-EDILDI\x27);\r\n        }\r\n        return;\r\n      }";
const idx2 = c.indexOf(old2);
console.log("game_refuse tapildi:", idx2 !== -1);
if (idx2 !== -1) {
  const rep2 = "if (msg.type === \x27game_refuse\x27) {\r\n        console.log(\x27GAME-REFUSE-TAPILDI!!! wsUser=\x27 + Boolean(wsUser) + \x27 gameRoom=\x27 + Boolean(ws.gameRoom));\r\n        if (ws.gamePlayer) {\r\n          msg.user = { id: ws.gamePlayer.id, name: ws.gamePlayer.name, male: ws.gamePlayer.male, vip: ws.gamePlayer.vip, pass_premium: ws.gamePlayer.pass_premium, top: ws.gamePlayer.top, photo_url: ws.gamePlayer.photo_url };\r\n        }\r\n        if (ws.refuseSlapActive && wsUser && msg.receiver_id) {\r\n          ws.refuseSlapActive = false;\r\n          addKissLeagueScore(wsUser.id, 1);\r\n          if (ws.gameRoom) {\r\n            broadcastToRoom(ws.gameRoom, null, { type: \x27game_turn_booster\x27, user_id: String(wsUser.id), receiver_id: String(msg.receiver_id), booster: \x27refuse_slap\x27 });\r\n          }\r\n        }\r\n        if (ws.gameRoom) {\r\n          broadcastToRoom(ws.gameRoom, null, msg);\r\n          console.log(\x27GAME-REFUSE-BROADCAST-EDILDI\x27);\r\n        }\r\n        return;\r\n      }";
  c = c.replace(old2, rep2);
}

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
