const fs = require("fs");
const path = "game_v2/yandex_v2.html";
let c = fs.readFileSync(path, "utf8");
const startMarker = "(function() {\n  function tryInjectShop() {";
const startIdx = c.indexOf(startMarker);
console.log("startIdx:", startIdx);
if (startIdx !== -1) {
  const endMarker = "})();\n</script>\n";
  const endIdx = c.indexOf(endMarker, startIdx) + endMarker.length;
  const simplified = `(function() {
  function mgToken() {
    return document.cookie.split('; ').find(r => r.startsWith('authToken='))?.split('=')[1] || '';
  }
  window.mgBuyCoins = async function(amount) {
    const token = mgToken();
    try {
      const res = await fetch('/api/shop/buy-coins', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
      const data = await res.json();
      if (res.ok) { alert(data.coins_added + ' coin elave edildi!'); location.reload(); } else { alert(data.error || 'Xeta'); }
    } catch (e) { alert('Xeta: ' + e.message); }
  };
  window.mgBuyVip = async function(period) {
    const token = mgToken();
    try {
      const res = await fetch('/api/shop/buy-vip', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ period }) });
      const data = await res.json();
      if (res.ok) { alert('VIP alindi!'); location.reload(); } else { alert(data.error || 'Xeta'); }
    } catch (e) { alert('Xeta: ' + e.message); }
  };
  window.mgBuyPass = async function() {
    const token = mgToken();
    try {
      const res = await fetch('/api/shop/buy-premium-pass', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } });
      const data = await res.json();
      if (res.ok) { alert(data.already_owned ? 'Artiq var!' : 'Premium Pass alindi!'); location.reload(); } else { alert(data.error || 'Xeta'); }
    } catch (e) { alert('Xeta: ' + e.message); }
  };
})();
</script>
`;
  c = c.slice(0, startIdx) + simplified + c.slice(endIdx);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
