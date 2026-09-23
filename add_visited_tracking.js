const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

function trackSnippet(uidExpr, roomExpr) {
  return `\n        if (${uidExpr}) { try { db.prepare('INSERT INTO visited_rooms (user_id, room_id, last_visited_at) VALUES (?, ?, datetime(\\'now\\')) ON CONFLICT(user_id, room_id) DO UPDATE SET last_visited_at = excluded.last_visited_at').run(${uidExpr}, ${roomExpr}); } catch(e) {} }`;
}

let replacements = 0;

// 1) ilkin qosulma (myId, myRoom.gameId)
const m1 = "if (myId) lastRoomByUserId.set(myId, myRoom.gameId);";
if (c.includes(m1)) { c = c.replace(m1, m1 + trackSnippet("myId", "myRoom.gameId")); replacements++; }

// 2) goto_random (rejoinedPlayer, newRoom)
const m2 = "ws.gameRoom = newRoom;";
if (c.includes(m2)) { c = c.replace(m2, m2 + trackSnippet("rejoinedPlayer && rejoinedPlayer.id", "newRoom.gameId")); replacements++; }

// 3) goto_user (rejoinedPlayer2, destRoom)
const m3 = "ws.gameRoom = destRoom;";
if (c.includes(m3)) { c = c.replace(m3, m3 + trackSnippet("rejoinedPlayer2 && rejoinedPlayer2.id", "destRoom.gameId")); replacements++; }

// 4) goto_specific_room (rejoinedPlayerX, targetRoom)
const m4 = "ws.gameRoom = targetRoom;";
if (c.includes(m4)) { c = c.replace(m4, m4 + trackSnippet("rejoinedPlayerX && rejoinedPlayerX.id", "targetRoom.gameId")); replacements++; }

console.log("Deyisdirilen yer sayi: " + replacements);
fs.writeFileSync(path, c, "utf8");
