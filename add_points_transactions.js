const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "db.prepare(\x27UPDATE users SET points = points + 1 WHERE id = ?\x27).run(Number(msg.receiver_id));";
if (c.includes(old1)) {
  c = c.replace(old1, old1 + "\r\n              db.prepare(\"INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, \x27dj_score_period\x27, 1, \x27kiss_song\x27)\").run(Number(msg.receiver_id));");
  count++;
}

const old2 = "db.prepare(\x27UPDATE users SET points = points + ? WHERE id = ?\x27).run(kissFireMultiplier, Number(receiverPlayer2.id));";
if (c.includes(old2)) {
  c = c.replace(old2, old2 + "\r\n              db.prepare(\"INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, \x27dj_score_period\x27, ?, \x27kiss_song\x27)\").run(Number(receiverPlayer2.id), kissFireMultiplier);");
  count++;
}

const old3 = "db.prepare(\x27UPDATE users SET points = points + 1 WHERE id = ?\x27).run(Number(receiverPlayer3.id));";
if (c.includes(old3)) {
  c = c.replace(old3, old3 + "\r\n              db.prepare(\"INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, \x27dj_score_period\x27, 1, \x27air_kiss_song\x27)\").run(Number(receiverPlayer3.id));");
  count++;
}

const old4 = "db.prepare(\x27UPDATE users SET points = points + ? WHERE id = ?\x27).run(djScoreAmt, wsUser.id);";
if (c.includes(old4)) {
  c = c.replace(old4, old4 + "\r\n            db.prepare(\"INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, \x27dj_score_period\x27, ?, \x27song_send\x27)\").run(wsUser.id, djScoreAmt);");
  count++;
}

console.log("Deyisdirilenler: " + count + "/4");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
