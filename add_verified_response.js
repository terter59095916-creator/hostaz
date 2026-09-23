const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "id: user.id, username: user.username, display_name: user.display_name,\r\n      photo_url: user.avatar_data ? (\x27/api/avatar/\x27 + user.id) : \x27\x27,\r\n      status: getActiveStatus(user),\r\n      friendship_status: friendship ? friendship.status : \x27none\x27,\r\n      is_me: targetId === req.user.id\r\n    });";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "id: user.id, username: user.username, display_name: user.display_name,\r\n      photo_url: user.avatar_data ? (\x27/api/avatar/\x27 + user.id) : \x27\x27,\r\n      status: getActiveStatus(user),\r\n      friendship_status: friendship ? friendship.status : \x27none\x27,\r\n      is_me: targetId === req.user.id,\r\n      is_verified: Boolean(user.is_verified),\r\n      gender: user.gender\r\n    });";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
