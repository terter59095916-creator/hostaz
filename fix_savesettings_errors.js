const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = fs.readFileSync("savesettings_output.txt", "utf8");
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = `async function saveSettings() {
const token = localStorage.getItem('authToken');
const name = document.getElementById('settings-name').value.trim();
const age = document.getElementById('settings-age').value;
const status = document.getElementById('settings-status').value;
const genderInput = document.querySelector('input[name=s-gender]:checked');
const gender = genderInput ? genderInput.value : null;
try {
if (name) {
const r1 = await fetch('/api/profile/name', {
method: 'POST',
headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
body: JSON.stringify({ display_name: name })
});
if (!r1.ok) { const e1 = await r1.json().catch(()=>({})); alert('Ad yadda saxlanmadi: ' + (e1.error || r1.status)); return; }
}
const r2 = await fetch('/api/profile/details', {
method: 'POST',
headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
body: JSON.stringify({ age: age ? Number(age) : null, gender })
});
if (!r2.ok) { const e2 = await r2.json().catch(()=>({})); alert('Yas/cins yadda saxlanmadi: ' + (e2.error || r2.status)); return; }
const r3 = await fetch('/api/profile/status', {
method: 'POST',
headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
body: JSON.stringify({ status })
});
if (!r3.ok) { const e3 = await r3.json().catch(()=>({})); alert('Status yadda saxlanmadi: ' + (e3.error || r3.status)); return; }
closeSettings();
loadProfile();
} catch (e) {
alert('Yadda saxlanmadi, yeniden cehd edin: ' + e.message);
}
}
`;
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
