const fs = require("fs");
const path = "public/admin/index.html";
let c = fs.readFileSync(path, "utf8");
const old = "<button class=\"danger\" onclick=\"toggleBan(${u.id}, ${u.is_banned ? 0 : 1})\">${u.is_banned ? \x27Blokdan \u00e7\u0131xar\x27 : \x27Blokla\x27}</button>";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = old + "\r\n        <button class=\"danger\" onclick=\"deleteUser(${u.id})\">Tam sil</button>";
  c = c.replace(old, replacement);
  const funcMarker = "async function promptPoints(id) {";
  const funcIdx = c.indexOf(funcMarker);
  const deleteFunc = "async function deleteUser(id) {\r\n  if (!confirm(\x27Bu istifad\u0259\u00e7ini v\u0259 b\u00fct\u00fcn \u0259laq\u0259li m\u0259lumatlar\u0131n\u0131 (dostlar, mesajlar, liderlik c\u0259dv\u0259li q\u0131lar\u0131) H\u018eM\u0130\u015e\u018eL\u0130K silm\u0259k ist\u0259yirsinizmi? Bu \u0259m\u0259liyyat GER\u0130 AL\u0130NA BiLM\u018eZ.\x27)) return;\r\n  await authFetch(`/api/admin/users/${id}`, { method: \x27DELETE\x27 });\r\n  loadUsers();\r\n}\r\n" + funcMarker;
  c = c.replace(funcMarker, deleteFunc);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
