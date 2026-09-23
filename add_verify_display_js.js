const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = "document.getElementById(\x27profile-name\x27).textContent = user.display_name || user.username;\ndocument.getElementById(\x27stat-points\x27).textContent = fmtNum(user.coins);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = `document.getElementById('profile-name').textContent = user.display_name || user.username;
if (user.is_verified) {
document.getElementById('profile-verify-badge').style.display = 'inline-flex';
document.getElementById('profile-verify-pill').style.display = 'none';
document.getElementById('avatar-ring-el').classList.add(user.gender === 'female' ? 'verified-female' : 'verified-male');
} else {
document.getElementById('profile-verify-badge').style.display = 'none';
document.getElementById('profile-verify-pill').style.display = 'flex';
}
document.getElementById('stat-points').textContent = fmtNum(user.coins);`;
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
