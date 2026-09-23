const fs = require("fs");
const path = "login_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = ":root{\n--bg-0:#170D22;\n--bg-1:#1F1229;\n--card:#2A1B3A;\n--card-hi:#33223f;\n--line:rgba(245,237,228,0.09);\n--coral:#FF5C7A;\n--coral-dim:#c94b64;\n--gold:#E8B34D;\n--ink:#F5EDE4;\n--muted:#a596b8;\n--muted-dim:#6f6187;\n--glow: 0 0 0 1px var(--line), 0 20px 60px -20px rgba(0,0,0,0.6);\n}";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = ":root{\n--bg-0:#1A0810;\n--bg-1:#240D16;\n--card:#33121F;\n--card-hi:#3D1626;\n--line:rgba(240,192,90,0.12);\n--coral:#E63950;\n--coral-dim:#B82A3E;\n--gold:#F0C05A;\n--ink:#FBEEE0;\n--muted:#C9A0A8;\n--muted-dim:#8A5F68;\n--glow: 0 0 0 1px var(--line), 0 20px 60px -20px rgba(0,0,0,0.7);\n}";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
