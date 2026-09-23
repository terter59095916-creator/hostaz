const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoutes = `app.post('/api/buy-tokens', authLib.requireUser, (req, res) => {
    const amount = Number((req.body || {}).crystal_amount);
    if (!amount || amount < 1) return res.status(400).json({ error: 'invalid_amount' });
    const user = db.prepare('SELECT crystals FROM users WHERE id = ?').get(req.user.id);
    if (!user || user.crystals < amount) return res.status(400).json({ error: 'insufficient_crystals' });
    const tokensGained = amount * 10;
    db.prepare('UPDATE users SET crystals = crystals - ?, live_tokens = live_tokens + ? WHERE id = ?').run(amount, tokensGained, req.user.id);
    const updated = db.prepare('SELECT crystals, live_tokens FROM users WHERE id = ?').get(req.user.id);
    res.json({ success: true, crystals: updated.crystals, live_tokens: updated.live_tokens });
});
app.get('/api/live-gifts-catalog', authLib.requireUser, (req, res) => {
    try {
        const assetsRaw = require('fs').readFileSync(require('path').join(__dirname, 'game-assets', 'assets.json'), 'utf8');
        const assets = JSON.parse(assetsRaw);
        const storeArr = assets.gifts.__store_v7 || assets.gifts.__store || [];
        const seen = new Set();
        const catalog = [];
        storeArr.forEach(g => {
            if (seen.has(g.id) || !assets.gifts[g.id]) return;
            seen.add(g.id);
            catalog.push({ id: g.id, image: assets.gifts[g.id].image, price: assets.gifts[g.id].storePrice || 1 });
        });
        res.json(catalog.slice(0, 80));
    } catch (e) { res.status(500).json({ error: 'catalog_error' }); }
});
app.get('/api/my-tokens', authLib.requireUser, (req, res) => {
    const user = db.prepare('SELECT live_tokens, crystals, gift_level_score FROM users WHERE id = ?').get(req.user.id);
    res.json(user || { live_tokens: 0, crystals: 0, gift_level_score: 0 });
});
`;
c = c.slice(0, idx) + newRoutes + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
