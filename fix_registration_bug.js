const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "app.get(\x27/api/admin/reset-all-registration\x27, (req, res) => {";
if (c.includes(old1)) {
  c = c.split(old1).join("app.get(\x27/api/admin/reset-all-registration\x27, authLib.requireAdmin, (req, res) => {");
  count++;
}

const old2 = "} else if (wsUser && !wsUser.game_registered) {";
if (c.includes(old2)) {
  c = c.split(old2).join("} else if (wsUser && !wsUser.game_registered && !wsUser.google_id && !wsUser.facebook_id && !wsUser.telegram_id) {");
  count++;
}

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
