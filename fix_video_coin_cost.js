const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (wsUser) {\r\n            db.prepare(\x27UPDATE users SET coins = coins - 5 WHERE id = ?\x27).run(wsUser.id);\r\n            console.log(\x27WS: mahni ucun coin cixarildi - \x27 + wsUser.username + \x27 duration=\x27 + msg.duration + \x27 title=\x27 + msg.title);\r\n            const djScoreAmt = (msg.provider === \x27cz\x27) ? 5 : 9;\r\n            db.prepare(\x27UPDATE users SET points = points + ? WHERE id = ?\x27).run(djScoreAmt, wsUser.id);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (wsUser) {\r\n            const musicCost = (msg.provider === \x27cz\x27) ? 5 : 9;\r\n            db.prepare(\x27UPDATE users SET coins = coins - ? WHERE id = ?\x27).run(musicCost, wsUser.id);\r\n            console.log(\x27WS: mahni ucun coin cixarildi - \x27 + wsUser.username + \x27 duration=\x27 + msg.duration + \x27 title=\x27 + msg.title + \x27 cost=\x27 + musicCost);\r\n            const djScoreAmt = musicCost;\r\n            db.prepare(\x27UPDATE users SET points = points + ? WHERE id = ?\x27).run(djScoreAmt, wsUser.id);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
