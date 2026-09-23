const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const friendGamesResponse = {\n          type: 'friend_games',\n          packet: ws.packetCounter++,\n          friends: [],\n          fellows: fellowsList,\n          history: []\n        };";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const historyList = [];\n        if (wsUser) {\n          const visitedRows = db.prepare('SELECT room_id FROM visited_rooms WHERE user_id = ? ORDER BY last_visited_at DESC LIMIT 10').all(wsUser.id);\n          visitedRows.forEach(function(row) {\n            if (ws.gameRoom && ws.gameRoom.gameId === row.room_id) return;\n            const histRoom = rooms.get(row.room_id);\n            let men = 0, women = 0, total = 0;\n            if (histRoom) {\n              histRoom.players.forEach(function(p) { if (p.male) men++; else women++; });\n              total = histRoom.players.size;\n            }\n            historyList.push({ gameId: row.room_id, men, women, bottle: histRoom ? (histRoom.bottleType || 'vipbottle') : 'vipbottle' });\n          });\n        }\n        const friendGamesResponse = {\n          type: 'friend_games',\n          packet: ws.packetCounter++,\n          friends: [],\n          fellows: fellowsList,\n          history: historyList\n        };";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
