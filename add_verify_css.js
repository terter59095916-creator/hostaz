const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = ".verify-pill svg{width:13px;height:13px;}";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = `.verify-pill svg{width:13px;height:13px;}
.avatar-ring.verified-female{background:conic-gradient(from 0deg, #ff5c9e, #ffb3d1, #ff2d78, #ff5c9e); animation:ring-spin 3s linear infinite;}
.avatar-ring.verified-male{background:conic-gradient(from 0deg, #4d9eff, #a3d4ff, #1f6fe0, #4d9eff); animation:ring-spin 3s linear infinite;}
@keyframes ring-spin{from{filter:hue-rotate(0deg);}to{filter:hue-rotate(360deg);}}
.verify-badge{display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; vertical-align:middle;}
.verify-badge svg{width:18px;height:18px;}
`;
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
