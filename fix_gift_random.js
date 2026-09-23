const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "case \x27gift\x27:\n          return {\n            type: \x27game_gift\x27,\n            gift_type: gift.type,\n            receiver_id: receiver.id\n          };";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "case \x27gift\x27:\n          return {\n            type: \x27game_gift\x27,\n            gift_type: gift.type,\n            receiver_id: receiver.id,\n            random: Math.floor(Math.random() * 1000000)\n          };";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
