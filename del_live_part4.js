const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const oldE = "} else if (msg.type === 'live_join') {\n        const hostId = Number(msg.host_id);\n        if (liveStreams.has(hostId)) {\n          const stream = liveStreams.get(hostId);\n          stream.viewers.add(ws);\n          ws.watchingLiveHostId = hostId;\n          sendGame(ws, { type: 'live_joined',  host_id: hostId, host_name: stream.hostName });\n        } else {\n          sendGame(ws, { type: 'live_not_found', });\n        }\n      } else if (msg.type === 'live_leave') {\n        if (ws.watchingLiveHostId && liveStreams.has(ws.watchingLiveHostId)) {\n          liveStreams.get(ws.watchingLiveHostId).viewers.delete(ws);\n        }\n      } else if (msg.type === 'live_chat') {\n        if (wsUser && msg.host_id) {\n          const hostId2 = Number(msg.host_id);\n          if (liveStreams.has(hostId2)) {\n            const stream2 = liveStreams.get(hostId2);\n            const chatMsg2 = { type: 'live_chat',  user: { id: wsUser.id, name: wsUser.display_name || wsUser.username }, text: msg.text };\n            stream2.viewers.forEach(v => sendGame(v, chatMsg2));\n            if (stream2.hostWs.readyState === WebSocket.OPEN) sendGame(stream2.hostWs, chatMsg2);\n          }\n        }\n      } else if (msg.type === 'live_gift') {\n        if (wsUser && msg.host_id) {\n          const hostId3 = Number(msg.host_id);\n          const giftTokenCost = Number(msg.token_cost) || 1;\n          const senderRow = db.prepare('SELECT tokens FROM users WHERE id = ?').get(wsUser.id);\n          if (senderRow && senderRow.tokens >= giftTokenCost) {\n            db.prepare('UPDATE users SET tokens = tokens - ? WHERE id = ?').run(giftTokenCost, wsUser.id);\n            db.prepare('UPDATE users SET live_balance = COALESCE(live_balance, 0) + ? WHERE id = ?').run(giftTokenCost, hostId3);\n            if (liveStreams.has(hostId3)) {\n              const stream3 = liveStreams.get(hostId3);\n              const giftMsg = { type: 'live_gift',  user: { id: wsUser.id, name: wsUser.display_name || wsUser.username }, gift_id: msg.gift_id, token_cost: giftTokenCost };\n              stream3.viewers.forEach(v => sendGame(v, giftMsg));\n              if (stream3.hostWs.readyState === WebSocket.OPEN) sendGame(stream3.hostWs, giftMsg);\n            }\n          }\n        }\n      }if (msg.type === 'bottle_click') {";
console.log("Found E:", c.includes(oldE));

const newE = "}if (msg.type === 'bottle_click') {";
c = c.replace(oldE, newE);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE PART 4");
