const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "<div class=\"avatar-ring\">";
if (c.includes(old1)) {
  c = c.split(old1).join("<div class=\"avatar-ring\" id=\"avatar-ring-el\">");
  count++;
}

const marker = "function triggerStoryUpload() {";
const idx = c.indexOf(marker);
if (idx !== -1) {
  const newFunc = `async function purchaseVerification() {
if (!confirm('Tesdiq alma - 1000 kristal xerclenecek. Davam edilsin?')) return;
const token = localStorage.getItem('authToken');
try {
const res = await fetch('/api/profile/verify', {
method: 'POST', headers: { 'Authorization': 'Bearer ' + token }
});
const data = await res.json();
if (res.ok) {
loadProfile();
} else {
alert(data.error === 'insufficient_crystals' ? 'Kifayet qeder kristaliniz yoxdur.' : 'Xeta bas verdi.');
}
} catch (e) { alert('Xeta: ' + e.message); }
}
` + marker;
  c = c.replace(marker, newFunc);
  count++;
}

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
