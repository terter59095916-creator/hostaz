const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

function chatHistorySnippet(roomVar, wsVar) {
  return "\r\n          if (" + roomVar + ".chatHistory && " + roomVar + ".chatHistory.length > 0) {\r\n            const cleanHistorySwitch = " + roomVar + ".chatHistory.map(function(histMsg) {\r\n              const freshMsg = Object.assign({}, histMsg);\r\n              delete freshMsg.packet;\r\n              return freshMsg;\r\n            });\r\n            " + wsVar + ".send(encodeMessage({ type: \x27game_chat_history\x27, messages: cleanHistorySwitch, packet: " + wsVar + ".packetCounter = (" + wsVar + ".packetCounter || 1000) + 1 }));\r\n          }";
}

const old1 = "ws.send(encodeMessage(reGameEnter));";
const idx1 = c.indexOf(old1);
console.log("goto_random tapildi:", idx1 !== -1);
if (idx1 !== -1) {
  c = c.replace(old1, old1 + chatHistorySnippet("newRoom", "ws"));
}

const old2 = "ws.send(encodeMessage(reGameEnter2));";
const idx2 = c.indexOf(old2);
console.log("goto_user tapildi:", idx2 !== -1);
if (idx2 !== -1) {
  c = c.replace(old2, old2 + chatHistorySnippet("destRoom", "ws"));
}

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
