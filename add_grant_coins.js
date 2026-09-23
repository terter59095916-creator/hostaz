const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-grant-coins/:id/:amount', (req, res) => {
    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(Number(req.params.amount), Number(req.params.id));
    const row = db.prepare('SELECT coins FROM users WHERE id = ?').get(Number(req.params.id));
    res.json({ new_balance: row.coins });
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
