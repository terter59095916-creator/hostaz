const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const friendGamesResponse = {\r\n          type: \x27friend_games\x27,\r\n          packet: ws.packetCounter++,\r\n          friends: [],\r\n          fellows: fellowsList,\r\n          history: []\r\n        };";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const historyList = [];\r\n        if (wsUser) {\r\n          const visitedRows = db.prepare(\x27SELECT room_id FROM visited_rooms WHERE user_id = ? ORDER BY last_visited_at DESC LIMIT 10\x27).all(wsUser.id);\r\n          visitedRows.forEach(function(row) {\r\n            if (ws.gameRoom && ws.gameRoom.gameId === row.room_id) return;\r\n            const histRoom = rooms.get(row.room_id);\r\n            let men = 0, women = 0;\r\n            if (histRoom) {\r\n              histRoom.players.forEach(function(p) { if (p.male) men++; else women++; });\r\n            }\r\n            historyList.push({ gameId: row.room_id, men, women, bottle: histRoom ? (histRoom.bottleType || \x27vipbottle\x27) : \x27vipbottle\x27 });\r\n          });\r\n        }\r\n        const friendGamesResponse = {\r\n          type: \x27friend_games\x27,\r\n          packet: ws.packetCounter++,\r\n          friends: [],\r\n          fellows: fellowsList,\r\n          history: historyList\r\n        };";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
