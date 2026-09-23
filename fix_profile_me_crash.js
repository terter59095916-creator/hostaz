const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "app.get(\x27/api/profile/me\x27, authLib.requireUser, (req, res) => {\r\n    const user = db.prepare(\x27SELECT id, username, display_name, points, coins, crystals, avatar_data, user_status, user_status_set_at, is_verified, gender FROM users WHERE id = ?\x27).get(req.user.id);\r\n    user.user_status = getActiveStatus(user);\r\n    res.json(user);\r\n});";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "app.get(\x27/api/profile/me\x27, authLib.requireUser, (req, res) => {\r\n    const user = db.prepare(\x27SELECT id, username, display_name, points, coins, crystals, avatar_data, user_status, user_status_set_at, is_verified, gender FROM users WHERE id = ?\x27).get(req.user.id);\r\n    if (!user) return res.status(401).json({ error: \x27user_not_found\x27 });\r\n    user.user_status = getActiveStatus(user);\r\n    res.json(user);\r\n});";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
