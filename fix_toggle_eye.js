const fs = require("fs");
const path = "login_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = "function toggleEye(id, btn){\nconst input = document.getElementById(id);\nconst isPw = input.type === \x27password\x27;\ninput.type = isPw ? \x27text\x27 : \x27password\x27;\n}";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "function toggleEye(id, btn){\nconst input = document.getElementById(id);\nconst isPw = input.type === \x27password\x27;\ninput.type = isPw ? \x27text\x27 : \x27password\x27;\nif (btn) btn.style.opacity = isPw ? \x271\x27 : \x27.55\x27;\nif (btn) btn.style.color = isPw ? \x27var(--gold)\x27 : \x27\x27;\n}";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
