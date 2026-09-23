const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const rejoinedPlayer = ws.gamePlayer ? Object.assign({}, ws.gamePlayer, { seat: newSeat }) : null;";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "let rejoinedPlayer = ws.gamePlayer ? Object.assign({}, ws.gamePlayer, { seat: newSeat }) : null;\r\n        if (rejoinedPlayer) {\r\n          delete rejoinedPlayer.ava_gift;\r\n          delete rejoinedPlayer.ava_gift_random;\r\n          delete rejoinedPlayer.hat;\r\n          delete rejoinedPlayer.drink;\r\n          if (rejoinedPlayer.id && newRoom.stickedGifts.has(rejoinedPlayer.id)) {\r\n            const freshGifts = newRoom.stickedGifts.get(rejoinedPlayer.id);\r\n            if (freshGifts.ava_gift) { rejoinedPlayer.ava_gift = freshGifts.ava_gift; rejoinedPlayer.ava_gift_random = freshGifts.ava_gift_random; }\r\n            if (freshGifts.hat) rejoinedPlayer.hat = freshGifts.hat;\r\n            if (freshGifts.drink) rejoinedPlayer.drink = freshGifts.drink;\r\n          }\r\n        }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
