const fs = require("fs");
const path = "C:\\bottle-server\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

// Fix SENDER's achievement chat message to use real user
const oldSender = "broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: '\\u2b50 ' + (wsUser.display_name || wsUser.username) + ' yeni nailiyyet qazandi: ' + achId + ' (seviyye ' + (newLevel + 1) + ')', receiver_id: '', receiver_name: '', user: { id: '0', name: 'Sistem', male: true } });";
console.log("Found sender:", c.includes(oldSender));
const newSender = "broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: '\\u2b50 Yeni nailiyyet qazandi: ' + achId + ' (seviyye ' + (newLevel + 1) + ')', receiver_id: '', receiver_name: '', user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== 'female', photo_url: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '' } });";
c = c.replace(oldSender, newSender);

// Fix RECEIVER's achievement chat message
const oldRecv = "const recvUserRow = db.prepare('SELECT display_name, username FROM users WHERE id = ?').get(msg.receiver_id);\r\n                  const recvDisplayName = recvUserRow ? (recvUserRow.display_name || recvUserRow.username) : 'Oyuncu';\r\n                  broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: '\\u2b50 ' + recvDisplayName + ' hediyye alaraq yeni nailiyyet qazandi: ' + achId + ' (seviyye ' + (recvNewLevel + 1) + ')', receiver_id: '', receiver_name: '', user: { id: '0', name: 'Sistem', male: true } });";
console.log("Found receiver:", c.includes(oldRecv));
const newRecv = "const recvUserRow = db.prepare('SELECT id, display_name, username, gender, avatar_data FROM users WHERE id = ?').get(msg.receiver_id);\r\n                  const recvDisplayName = recvUserRow ? (recvUserRow.display_name || recvUserRow.username) : 'Oyuncu';\r\n                  broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: '\\u2b50 Hediyye alaraq yeni nailiyyet qazandi: ' + achId + ' (seviyye ' + (recvNewLevel + 1) + ')', receiver_id: '', receiver_name: '', user: recvUserRow ? { id: String(recvUserRow.id), name: recvDisplayName, male: recvUserRow.gender !== 'female', photo_url: recvUserRow.avatar_data ? ('/api/avatar/' + recvUserRow.id) : '' } : { id: '0', name: recvDisplayName, male: true } });";
c = c.replace(oldRecv, newRecv);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
