const fs = require("fs");
const path = "game_v2/yandex_v2.html";
let c = fs.readFileSync(path, "utf8");
const shopInject = `
<script>
(function() {
  function tryInjectShop() {
    const dialogs = document.querySelectorAll('.popup, [class*="dialog"], [class*="modal"]');
    for (const dlg of dialogs) {
      if (dlg.dataset.mygameShopInjected) continue;
      const text = dlg.textContent || '';
      if (text.includes('Kalp al') || text.includes('Kristal al') || text.includes('Gold al')) {
        dlg.dataset.mygameShopInjected = '1';
        injectShopButtons(dlg);
      }
    }
  }
  function injectShopButtons(container) {
    const box = document.createElement('div');
    box.style.cssText = 'padding:14px; background:#1a0f24; border-radius:12px; margin:10px;';
    box.innerHTML = \`
      <div style="color:#ffce85; font-weight:700; font-size:13px; margin-bottom:10px;">Kristal ile coin al</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
        <button data-mg-amt="1000" style="grid-column:span 2;background:linear-gradient(155deg,#3d2755,#2c1a3f);border:1px solid #ffce85;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;">1000 coin (+10% bonus) - 1000💎</button>
        <button data-mg-amt="500" style="background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;">500 coin - 500💎</button>
        <button data-mg-amt="100" style="background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;">100 coin - 100💎</button>
        <button data-mg-amt="50" style="background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;">50 coin - 50💎</button>
        <button data-mg-amt="10" style="grid-column:span 2;background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;">10 coin - 10💎</button>
      </div>
      <div style="color:#ffce85; font-weight:700; font-size:13px; margin:14px 0 10px;">VIP status</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
        <button data-mg-vip="week" style="background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;">1 hefte - 300💎</button>
        <button data-mg-vip="month" style="background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;">1 ay - 500💎</button>
      </div>
      <div style="color:#ffce85; font-weight:700; font-size:13px; margin:14px 0 10px;">Premium Pass</div>
      <button data-mg-pass="1" style="width:100%;background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;">Premium Pass - 500💎</button>
    \`;
    container.appendChild(box);
    box.querySelectorAll('[data-mg-amt]').forEach(btn => { btn.onclick = () => mgBuyCoins(Number(btn.dataset.mgAmt)); });
    box.querySelectorAll('[data-mg-vip]').forEach(btn => { btn.onclick = () => mgBuyVip(btn.dataset.mgVip); });
    box.querySelectorAll('[data-mg-pass]').forEach(btn => { btn.onclick = () => mgBuyPass(); });
  }
  function mgToken() {
    return document.cookie.split('; ').find(r => r.startsWith('authToken='))?.split('=')[1] || '';
  }
  window.mgBuyCoins = async function(amount) {
    if (!confirm(amount + ' kristal xerclenecek. Davam?')) return;
    const token = mgToken();
    try {
      const res = await fetch('/api/shop/buy-coins', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
      const data = await res.json();
      if (res.ok) { alert(data.coins_added + ' coin elave edildi!'); location.reload(); } else { alert(data.error || 'Xeta'); }
    } catch (e) { alert('Xeta: ' + e.message); }
  };
  window.mgBuyVip = async function(period) {
    if (!confirm((period === 'week' ? '300' : '500') + ' kristal xerclenecek. Davam?')) return;
    const token = mgToken();
    try {
      const res = await fetch('/api/shop/buy-vip', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ period }) });
      const data = await res.json();
      if (res.ok) { alert('VIP alindi!'); location.reload(); } else { alert(data.error || 'Xeta'); }
    } catch (e) { alert('Xeta: ' + e.message); }
  };
  window.mgBuyPass = async function() {
    if (!confirm('500 kristal xerclenecek. Davam?')) return;
    const token = mgToken();
    try {
      const res = await fetch('/api/shop/buy-premium-pass', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } });
      const data = await res.json();
      if (res.ok) { alert(data.already_owned ? 'Artiq var!' : 'Premium Pass alindi!'); location.reload(); } else { alert(data.error || 'Xeta'); }
    } catch (e) { alert('Xeta: ' + e.message); }
  };
  const observer = new MutationObserver(() => tryInjectShop());
  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(tryInjectShop, 1000);
})();
</script>
`;
c = c.replace("</body>", shopInject + "\n</body>");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
