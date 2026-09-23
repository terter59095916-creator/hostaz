const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "historyList.push({ gameId: row.room_id, men, women, bottle: histRoom ? (histRoom.bottleType || \x27vipbottle\x27) : \x27vipbottle\x27 });";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "historyList.push({ game_id: row.room_id, men, women, bottle: histRoom ? (histRoom.bottleType || \x27vipbottle\x27) : \x27vipbottle\x27 });";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
