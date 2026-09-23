const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "status: profileUser ? (profileUser.user_status || \x27\x27) : \x27\x27,";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "status: getActiveStatus(profileUser),";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
