const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = "<img id=\"profile-avatar\" src=\"https://i.pravatar.cc/200?img=13\" alt=\"\">";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const grayPlaceholder = "data:image/svg+xml,%3Csvg xmlns=\x27http://www.w3.org/2000/svg\x27 width=\x27200\x27 height=\x27200\x27%3E%3Crect width=\x27200\x27 height=\x27200\x27 fill=\x27%23333\x27/%3E%3C/svg%3E";
  const replacement = "<img id=\"profile-avatar\" src=\"" + grayPlaceholder + "\" alt=\"\">";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
