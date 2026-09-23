const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-check-user-full/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
    if (row && row.avatar_data) row.avatar_data = row.avatar_data.substring(0, 50) + '...';
    if (row && row.password_hash) row.password_hash = '[hidden]';
    res.json(row || {});
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
