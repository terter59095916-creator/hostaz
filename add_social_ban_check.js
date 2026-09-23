const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "let user = db.prepare(\x27SELECT * FROM users WHERE google_id = ?\x27).get(googleId);";
if (c.includes(old1)) {
  const rep1 = old1 + "\n        if (user && user.is_banned) {\n          if (user.ban_until && new Date(user.ban_until) <= new Date()) {\n            db.prepare(\x27UPDATE users SET is_banned=0, ban_until=NULL WHERE id=?\x27).run(user.id);\n          } else {\n            return res.status(403).json({ error: \x27user_banned\x27, ban_until: user.ban_until });\n          }\n        }";
  c = c.split(old1).join(rep1);
  count++;
}

const old2 = "let user = db.prepare(\x27SELECT * FROM users WHERE telegram_id = ?\x27).get(telegramId);";
if (c.includes(old2)) {
  const rep2 = old2 + "\n        if (user && user.is_banned) {\n          if (user.ban_until && new Date(user.ban_until) <= new Date()) {\n            db.prepare(\x27UPDATE users SET is_banned=0, ban_until=NULL WHERE id=?\x27).run(user.id);\n          } else {\n            return res.status(403).json({ error: \x27user_banned\x27, ban_until: user.ban_until });\n          }\n        }";
  c = c.split(old2).join(rep2);
  count++;
}

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
