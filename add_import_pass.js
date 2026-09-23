const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.post('/api/temp-import-pass', (req, res) => {
    const rows = req.body || [];
    const del = db.prepare('DELETE FROM pass_level_rewards').run();
    const ins = db.prepare('INSERT INTO pass_level_rewards (level, free_gold, paid_gold) VALUES (?, ?, ?)');
    let count = 0;
    rows.forEach(r => { ins.run(r.level, r.free_gold, r.paid_gold); count++; });
    res.json({ deleted: del.changes, inserted: count });
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
