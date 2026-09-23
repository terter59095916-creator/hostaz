const fs = require("fs");
const path = "C:\\bottle-server\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const oldMultiplier = "const recvCounters = baseCounters ? baseCounters.map(n => n * 2) : null;";
console.log("Found multiplier:", c.includes(oldMultiplier));
const newMultiplier = "const recvCounters = baseCounters ? baseCounters.map(n => n * 5) : null;";
c = c.replace(oldMultiplier, newMultiplier);

const oldNotify = "console.log('WS: ALICI nailiyyeti artirildi - user_id=' + msg.receiver_id + ' - ' + recvAchId + ' seviyye=' + recvNewLevel + ' say=' + recvRawCount);\r\n                if (ws.gameRoom) {";
console.log("Found notify anchor:", c.includes(oldNotify));
const newNotify = "console.log('WS: ALICI nailiyyeti artirildi - user_id=' + msg.receiver_id + ' - ' + recvAchId + ' seviyye=' + recvNewLevel + ' say=' + recvRawCount);\r\n                const recvBonusAmount = (recvNewLevel + 1) * 5;\r\n                db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(recvBonusAmount, msg.receiver_id);\r\n                const recvWs = userIdToWs.get(Number(msg.receiver_id));\r\n                if (recvWs) {\r\n                  try { recvWs.send(encodeMessage({ packet: nextPacket(recvWs), type: 'achievement_bonus', user: { id: String(msg.receiver_id) }, achievement_id: achId, level: recvNewLevel, timestamp: Date.now(), bonus: recvBonusAmount })); } catch (e) {}\r\n                }\r\n                if (ws.gameRoom) {";
c = c.replace(oldNotify, newNotify);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
