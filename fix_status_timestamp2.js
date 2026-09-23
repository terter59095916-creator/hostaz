const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "db.prepare(\x27UPDATE users SET user_status = ?, user_status_set_at = datetime(\x27\x27now\x27\x27) WHERE id = ?\x27).run(status, req.user.id);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "db.prepare(\"UPDATE users SET user_status = ?, user_status_set_at = datetime(\x27now\x27) WHERE id = ?\").run(status, req.user.id);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
