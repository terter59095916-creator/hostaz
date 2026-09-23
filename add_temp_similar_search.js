const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-search-similar/:pattern', (req, res) => {
    const pattern = '%' + req.params.pattern + '%';
    const users = db.prepare('SELECT id, username, display_name, created_at FROM users WHERE username LIKE ? OR display_name LIKE ? ORDER BY created_at ASC').all(pattern, pattern);
    res.json(users);
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
