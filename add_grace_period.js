const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "ws.on('close', () => {\r\n    clearInterval(activityInterval);\r\n    console.log('WS: baglandi');\r\n    if (ws.nightRoomId) leaveNightRoom(ws, 'disconnect');\r\n    if (wsUser && userIdToWs.get(wsUser.id) === ws) userIdToWs.delete(wsUser.id);\r\n    if (ws.gameRoom) {\r\n      removePlayerFromRoom(ws.gameRoom, ws);\r\n    }";
console.log("Found:", c.includes(old1));

const new1 = "ws.on('close', (code) => {\r\n    clearInterval(activityInterval);\r\n    console.log('WS: baglandi');\r\n    if (ws.nightRoomId) leaveNightRoom(ws, 'disconnect');\r\n    if (wsUser && userIdToWs.get(wsUser.id) === ws) userIdToWs.delete(wsUser.id);\r\n    if (ws.gameRoom) {\r\n      if (code === 1000) {\r\n        removePlayerFromRoom(ws.gameRoom, ws);\r\n      } else {\r\n        const roomAtCloseGrace = ws.gameRoom;\r\n        setTimeout(() => {\r\n          if (roomAtCloseGrace.players.has(ws)) {\r\n            console.log('WS: 6san gozleme bitdi, oyunchu masadan cixarilir (reconnect olmadi)');\r\n            removePlayerFromRoom(roomAtCloseGrace, ws);\r\n          }\r\n        }, 6000);\r\n      }\r\n    }";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
