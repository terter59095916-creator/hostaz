const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "db.prepare(\x27UPDATE users SET price_stat = COALESCE(price_stat, 0) + ? WHERE id = ?\x27).run(currentPrice, wsUser.id);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = old + "\r\n              db.prepare(\"INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, \x27price_period\x27, ?, \x27harem_purchase\x27)\").run(wsUser.id, currentPrice);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
