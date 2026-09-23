const fs = require("fs");
const path = "public/admin/index.html";
let c = fs.readFileSync(path, "utf8");
const old = "<button onclick=\"showRelatedAccounts(${u.id})\">\uD83D\uDD17 \u018flaq\u0259li hesablar</button>";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = old + "\r\n        <button class=\"danger\" onclick=\"banDevice(${u.id})\">\uD83D\uDCF5 Cihaz\u0131 banla</button>";
  c = c.replace(old, replacement);
  const funcMarker = "async function promptPoints(id) {";
  const banFunc = "async function banDevice(id) {\r\n  if (!confirm('Bu istifad\u0259\u00e7inin CIHAZINI banlamaq ist\u0259yirsinizmi? Bu cihazdan hi\u00e7 bir hesabla giri\u015f/qeydiyyat m\u00fcmk\u00fcn olmayacaq.')) return;\r\n  const result = await authFetch(`/api/admin/ban-device/${id}`, { method: 'POST' });\r\n  if (result.error === 'no_device_found') { alert('Bu istifad\u0259\u00e7i \u00fc\u00e7\u00fcn cihaz m\u0259lumat\u0131 tap\u0131lmad\u0131.'); return; }\r\n  alert('Cihaz banland\u0131 (' + result.banned_count + ' cihaz).');\r\n}\r\n" + funcMarker;
  c = c.replace(funcMarker, banFunc);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
