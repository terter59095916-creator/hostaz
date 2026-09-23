const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "<p id=\"profile-status\" class=\"status-line\" style=\"display:none;\"></p>";
if (c.includes(old1)) {
  c = c.split(old1).join("<p id=\"profile-status\" class=\"status-line\" style=\"display:none;\"></p>\n<p id=\"profile-id-display\" style=\"margin:4px 0 0; font-size:12px; color:var(--muted); opacity:.7;\"></p>");
  count++;
}

const old2 = "document.getElementById(\x27stat-points\x27).textContent = fmtNum(user.coins);";
if (c.includes(old2)) {
  c = c.split(old2).join("document.getElementById(\x27profile-id-display\x27).textContent = \x27ID: \x27 + user.id;\ndocument.getElementById(\x27stat-points\x27).textContent = fmtNum(user.coins);");
  count++;
}

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
