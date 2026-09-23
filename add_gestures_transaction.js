const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "db.prepare(\x27UPDATE users SET tokens = tokens - 1, gestures_sent = gestures_sent + 1 WHERE id = ?\x27).run(wsUser.id);\r\n              wsUser.tokens = wsUser.tokens - 1;\r\n              wsUser.gestures_sent = (wsUser.gestures_sent || 0) + 1;";
const idx = c.indexOf(old);
console.log("gestures Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "db.prepare(\x27UPDATE users SET tokens = tokens - 1, gestures_sent = gestures_sent + 1 WHERE id = ?\x27).run(wsUser.id);\r\n              wsUser.tokens = wsUser.tokens - 1;\r\n              wsUser.gestures_sent = (wsUser.gestures_sent || 0) + 1;\r\n              db.prepare(\"INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, \x27gestures_period\x27, 1, \x27gesture\x27)\").run(wsUser.id);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
