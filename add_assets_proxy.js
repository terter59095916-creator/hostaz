const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/assets-proxy', async (req, res) => {
    try {
        const upstreamRes = await fetch('https://butilochka.cdnvideo.ru/mobile/assets.json?c9c6c5dbd89e12cc');
        const json = await upstreamRes.json();
        if (json.bottles && Array.isArray(json.bottles.__store)) {
            const existingIds = new Set(json.bottles.__store.map(b => b.id));
            const allBottleKeys = Object.keys(json.bottles).filter(k => k !== '__store');
            allBottleKeys.forEach(key => {
                if (!existingIds.has(key)) {
                    json.bottles.__store.push({ id: key });
                }
            });
            console.log('WS: assets-proxy - sise sayi genisleneildi, yeni __store uzunlugu=' + json.bottles.__store.length);
        }
        res.set('Content-Type', 'application/json');
        res.set('Cache-Control', 'no-store');
        res.send(JSON.stringify(json));
    } catch (e) {
        console.error('assets-proxy xetasi:', e.message);
        res.status(500).json({ error: 'proxy_failed' });
    }
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
