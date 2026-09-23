const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "msg.type === \x27game_chat_message\x27)) {\r\n          const today = new Date().toISOString().slice(0, 10);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "msg.type === \x27game_chat_message\x27)) {\r\n          const chatTextToCheck = (msg.body || msg.text || \x27\x27);\r\n          if (containsBannedWord(chatTextToCheck) || containsPhoneNumber(chatTextToCheck)) {\r\n            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: \x27chat_blocked\x27, reason: containsPhoneNumber(chatTextToCheck) ? \x27phone_number\x27 : \x27banned_word\x27 }));\r\n            console.log(\x27WS: mesaj bloklandi (pis soz/nomre) - \x27 + wsUser.username + \x27 - \x27 + chatTextToCheck.substring(0,50));\r\n            return;\r\n          }\r\n          const today = new Date().toISOString().slice(0, 10);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
