const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
const idx = c.lastIndexOf("</body>");
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const shopHtml = `<div id="shop-modal" style="display:none; position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,.7); align-items:center; justify-content:center; padding:16px;">
<div style="background:#1a0f24; border-radius:20px; max-width:400px; width:100%; max-height:85vh; overflow-y:auto; padding:20px; position:relative;">
<button onclick="closeShop()" style="position:absolute; top:14px; right:14px; background:none; border:none; color:#fff; font-size:22px; cursor:pointer;">&times;</button>
<h2 style="color:#fff; margin:0 0 16px; font-family:Georgia,serif;">Magaza</h2>
<h3 style="color:#ffce85; font-size:14px; margin:16px 0 8px;">VIP Status</h3>
<div style="display:flex; gap:8px; margin-bottom:16px;">
<button onclick="buyVip('week')" style="flex:1; background:#2c1a3f; border:1px solid #444; border-radius:12px; padding:12px 8px; color:#fff; cursor:pointer;">1 Hefte<br><b style="color:#ffce85;">300 kristal</b></button>
<button onclick="buyVip('month')" style="flex:1; background:#2c1a3f; border:1px solid #444; border-radius:12px; padding:12px 8px; color:#fff; cursor:pointer;">1 Ay<br><b style="color:#ffce85;">500 kristal</b></button>
</div>
<h3 style="color:#ffce85; font-size:14px; margin:16px 0 8px;">Premium Pass</h3>
<button onclick="buyPremiumPass()" style="width:100%; background:#2c1a3f; border:1px solid #444; border-radius:12px; padding:12px; color:#fff; cursor:pointer; margin-bottom:16px;">Premium Pass Al - <b style="color:#ffce85;">500 kristal</b></button>
<h3 style="color:#ffce85; font-size:14px; margin:16px 0 8px;">Coin Al</h3>
<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
<button onclick="buyCoins(10)" style="background:#2c1a3f; border:1px solid #444; border-radius:12px; padding:12px 8px; color:#fff; cursor:pointer;">10 coin<br><b style="color:#ffce85;">10 kristal</b></button>
<button onclick="buyCoins(50)" style="background:#2c1a3f; border:1px solid #444; border-radius:12px; padding:12px 8px; color:#fff; cursor:pointer;">50 coin<br><b style="color:#ffce85;">50 kristal</b></button>
<button onclick="buyCoins(100)" style="background:#2c1a3f; border:1px solid #444; border-radius:12px; padding:12px 8px; color:#fff; cursor:pointer;">100 coin<br><b style="color:#ffce85;">100 kristal</b></button>
<button onclick="buyCoins(500)" style="background:#2c1a3f; border:1px solid #444; border-radius:12px; padding:12px 8px; color:#fff; cursor:pointer;">500 coin<br><b style="color:#ffce85;">500 kristal</b></button>
<button onclick="buyCoins(1000)" style="grid-column:span 2; background:linear-gradient(155deg,#3d2755,#2c1a3f); border:1px solid #ffce85; border-radius:12px; padding:12px 8px; color:#fff; cursor:pointer;">1000 coin (+10% bonus)<br><b style="color:#ffce85;">1000 kristal</b></button>
</div>
</div>
</div>
<script>
function openShop() { document.getElementById('shop-modal').style.display = 'flex'; }
function closeShop() { document.getElementById('shop-modal').style.display = 'none'; }
async function buyVip(period) {
if (!confirm((period === 'week' ? '300' : '500') + ' kristal xerclenecek. Davam edilsin?')) return;
const token = localStorage.getItem('authToken');
try {
const res = await fetch('/api/shop/buy-vip', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ period }) });
const data = await res.json();
if (res.ok) { alert('VIP status alindi!'); closeShop(); loadProfile(); } else { alert(data.error === 'insufficient_crystals' ? 'Kifayet qeder kristaliniz yoxdur.' : 'Xeta bas verdi.'); }
} catch (e) { alert('Xeta: ' + e.message); }
}
async function buyPremiumPass() {
if (!confirm('500 kristal xerclenecek. Davam edilsin?')) return;
const token = localStorage.getItem('authToken');
try {
const res = await fetch('/api/shop/buy-premium-pass', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } });
const data = await res.json();
if (res.ok) { alert(data.already_owned ? 'Artiq var!' : 'Premium Pass alindi!'); closeShop(); } else { alert(data.error === 'insufficient_crystals' ? 'Kifayet qeder kristaliniz yoxdur.' : 'Xeta bas verdi.'); }
} catch (e) { alert('Xeta: ' + e.message); }
}
async function buyCoins(amount) {
if (!confirm(amount + ' kristal xerclenecek. Davam edilsin?')) return;
const token = localStorage.getItem('authToken');
try {
const res = await fetch('/api/shop/buy-coins', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
const data = await res.json();
if (res.ok) { alert(data.coins_added + ' coin elave edildi' + (data.bonus > 0 ? ' (' + data.bonus + ' bonus daxil)' : '') + '!'); closeShop(); loadProfile(); } else { alert(data.error === 'insufficient_crystals' ? 'Kifayet qeder kristaliniz yoxdur.' : 'Xeta bas verdi.'); }
} catch (e) { alert('Xeta: ' + e.message); }
}
</script>
</body>`;
  c = c.slice(0, idx) + shopHtml + c.slice(idx + 7);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
