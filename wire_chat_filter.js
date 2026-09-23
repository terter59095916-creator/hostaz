const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (wsUser && (msg.type === 'game_chat' || msg.type === 'game_chat_message')) {\n          const today = new Date().toISOString().slice(0, 10);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (wsUser && (msg.type === 'game_chat' || msg.type === 'game_chat_message')) {\n          const chatTextToCheck = (msg.body || msg.text || '');\n          if (containsBannedWord(chatTextToCheck) || containsPhoneNumber(chatTextToCheck)) {\n            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'chat_blocked', reason: containsPhoneNumber(chatTextToCheck) ? 'phone_number' : 'banned_word' }));\n            console.log('WS: mesaj bloklandi (pis soz/nomre) - ' + wsUser.username + ' - ' + chatTextToCheck.substring(0,50));\n            return;\n          }\n          const today = new Date().toISOString().slice(0, 10);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
