const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = "<p id=\"profile-id-display\" style=\"margin:4px 0 0; font-size:12px; color:var(--muted); opacity:.7;\"></p>";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = old + "\n<button onclick=\"openShop()\" style=\"margin-top:10px; background:linear-gradient(155deg,#ffce85,#e8b34d); border:none; border-radius:20px; padding:8px 18px; font-size:13px; font-weight:700; color:#1a0f24; cursor:pointer;\">Magaza</button>";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
