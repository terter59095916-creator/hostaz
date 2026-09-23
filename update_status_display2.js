const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "const user = db.prepare(\x27SELECT id, username, display_name, avatar_data, user_status FROM users WHERE id = ?\x27).get(targetId);";
if (c.includes(old1)) {
  c = c.split(old1).join("const user = db.prepare(\x27SELECT id, username, display_name, avatar_data, user_status, user_status_set_at FROM users WHERE id = ?\x27).get(targetId);");
  count++;
}

const old2 = "status: user.user_status || \x27\x27,";
if (c.includes(old2)) {
  c = c.split(old2).join("status: getActiveStatus(user),");
  count++;
}

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
