const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const newRoutes = `app.post('/api/shop/buy-coins', authLib.requireUser, (req, res) => {
    const { amount } = req.body || {};
    const validAmounts = [10, 50, 100, 500, 1000];
    if (!validAmounts.includes(Number(amount))) return res.status(400).json({ error: 'invalid_amount' });
    const row = db.prepare('SELECT crystals FROM users WHERE id = ?').get(req.user.id);
    if (!row || row.crystals < amount) return res.status(400).json({ error: 'insufficient_crystals' });
    let coinsToAdd = Number(amount);
    let bonus = 0;
    if (Number(amount) === 1000) { bonus = Math.floor(coinsToAdd * 0.1); coinsToAdd += bonus; }
    db.prepare('UPDATE users SET crystals = crystals - ?, coins = coins + ? WHERE id = ?').run(amount, coinsToAdd, req.user.id);
    res.json({ success: true, coins_added: coinsToAdd, bonus: bonus });
});
app.post('/api/shop/buy-vip', authLib.requireUser, (req, res) => {
    const { period } = req.body || {};
    const prices = { week: 300, month: 500 };
    const days = { week: 7, month: 30 };
    if (!prices[period]) return res.status(400).json({ error: 'invalid_period' });
    const row = db.prepare('SELECT crystals, vip_until FROM users WHERE id = ?').get(req.user.id);
    if (!row || row.crystals < prices[period]) return res.status(400).json({ error: 'insufficient_crystals' });
    const now = new Date();
    const currentExpiry = row.vip_until && new Date(row.vip_until) > now ? new Date(row.vip_until) : now;
    const newExpiry = new Date(currentExpiry.getTime() + days[period] * 24 * 60 * 60 * 1000);
    db.prepare('UPDATE users SET crystals = crystals - ?, is_vip = 1, vip_until = ? WHERE id = ?').run(prices[period], newExpiry.toISOString(), req.user.id);
    res.json({ success: true, vip_until: newExpiry.toISOString() });
});
app.post('/api/shop/buy-premium-pass', authLib.requireUser, (req, res) => {
    const row = db.prepare('SELECT crystals, pass_premium FROM users WHERE id = ?').get(req.user.id);
    if (row && row.pass_premium) return res.json({ success: true, already_owned: true });
    if (!row || row.crystals < 500) return res.status(400).json({ error: 'insufficient_crystals' });
    db.prepare('UPDATE users SET crystals = crystals - 500, pass_premium = 1 WHERE id = ?').run(req.user.id);
    res.json({ success: true });
});
`;
  c = c.slice(0, idx) + newRoutes + c.slice(idx);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
