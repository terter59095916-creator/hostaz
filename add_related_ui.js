const fs = require("fs");
const path = "public/admin/index.html";
let c = fs.readFileSync(path, "utf8");
const old = "<button class=\"danger\" onclick=\"deleteUser(${u.id})\">Tam sil</button>";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = old + "\r\n        <button onclick=\"showRelatedAccounts(${u.id})\">\uD83D\uDD17 \u018flaq\u0259li hesablar</button>";
  c = c.replace(old, replacement);
  const funcMarker = "async function promptPoints(id) {";
  const funcIdx = c.indexOf(funcMarker);
  const relatedFunc = "async function showRelatedAccounts(id) {\r\n  const related = await authFetch(`/api/admin/related-accounts/${id}`);\r\n  if (!related.length) { alert('Bu istifad\u0259\u00e7i il\u0259 eyni IP-d\u0259n giri\u015f etmi\u015f ba\u015fqa hesab tap\u0131lmad\u0131.'); return; }\r\n  const list = related.map(u => `#${u.id} - ${u.display_name || u.username}${u.is_banned ? ' (BLOKLU)' : ''}`).join('\\n');\r\n  alert('Eyni IP-d\u0259n giri\u015f etmi\u015f hesablar:\\n\\n' + list);\r\n}\r\n" + funcMarker;
  c = c.replace(funcMarker, relatedFunc);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
