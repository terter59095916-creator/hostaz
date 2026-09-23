const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-check-kicked/:id', (req, res) => {
    const row = db.prepare('SELECT id, username, kicked_until, kicked_from_game_id FROM users WHERE id = ?').get(Number(req.params.id));
    res.json(row || {});
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
