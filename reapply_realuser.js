const fs = require("fs");
const path = "C:\\bottle-server\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: '\\u2b50 ' + (wsUser.display_name || wsUser.username) + ' yeni nailiyyet qazandi: ' + achId + ' (seviyye ' + (newLevel + 1) + ')', receiver_id: '', receiver_name: '', user: { id: '0', name: 'Sistem', male: true } });";
console.log("Found:", c.includes(old1));

const new1 = "broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: '\\u2b50 Yeni nailiyyet qazandi: ' + achId + ' (seviyye ' + (newLevel + 1) + ')', receiver_id: '', receiver_name: '', user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== 'female', photo_url: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '' } });";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
