const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const rejoinedPlayer2 = ws.gamePlayer ? Object.assign({}, ws.gamePlayer, { seat: destSeat }) : null;";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "let rejoinedPlayer2 = ws.gamePlayer ? Object.assign({}, ws.gamePlayer, { seat: destSeat }) : null;\r\n          if (rejoinedPlayer2) {\r\n            delete rejoinedPlayer2.ava_gift;\r\n            delete rejoinedPlayer2.ava_gift_random;\r\n            delete rejoinedPlayer2.hat;\r\n            delete rejoinedPlayer2.drink;\r\n            if (rejoinedPlayer2.id && destRoom.stickedGifts.has(rejoinedPlayer2.id)) {\r\n              const freshGifts2 = destRoom.stickedGifts.get(rejoinedPlayer2.id);\r\n              if (freshGifts2.ava_gift) { rejoinedPlayer2.ava_gift = freshGifts2.ava_gift; rejoinedPlayer2.ava_gift_random = freshGifts2.ava_gift_random; }\r\n              if (freshGifts2.hat) rejoinedPlayer2.hat = freshGifts2.hat;\r\n              if (freshGifts2.drink) rejoinedPlayer2.drink = freshGifts2.drink;\r\n            }\r\n          }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
