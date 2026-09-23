const fs = require("fs");
const path = "C:\\bottle-server\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

// Step 1: extract and remove the broken receiver block from its WRONG location
const brokenBlockStart = "          if (achId && msg.receiver_id) {\r\n            const recvAchId = achId + '_recv';";
const idxStart = c.indexOf(brokenBlockStart);
console.log("Found broken block start:", idxStart >= 0);

// find the matching end: the block ends right before "\r\nif (msg.receiver_id && ws.gameRoom) {" (the sticker logic)
const endMarker = "\r\nif (msg.receiver_id && ws.gameRoom) {";
const idxEnd = c.indexOf(endMarker, idxStart);
console.log("Found end marker after block:", idxEnd >= 0);

const receiverBlockText = c.substring(idxStart, idxEnd);
console.log("Extracted block length:", receiverBlockText.length);

// Remove it from wrong location (also remove the blank line before it if present)
c = c.substring(0, idxStart) + c.substring(idxEnd);

// Step 2: insert it in the RIGHT location - right after the sender if(achId){...} block closes, but still inside if(price>0)
const correctAnchor = "                console.log('WS: nailiyyet sayi artirildi (seviyye deyismedi) - ' + wsUser.username + ' - ' + achId + ' say=' + rawCount);\r\n              }\r\n            }\r\n          }";
console.log("Found correct anchor:", c.includes(correctAnchor));
const correctReplacement = "                console.log('WS: nailiyyet sayi artirildi (seviyye deyismedi) - ' + wsUser.username + ' - ' + achId + ' say=' + rawCount);\r\n              }\r\n            }\r\n            " + receiverBlockText.trim() + "\r\n          }";
c = c.replace(correctAnchor, correctReplacement);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
