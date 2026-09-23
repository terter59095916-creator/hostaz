const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-find-user/:username', (req, res) => {
    const user = db.prepare('SELECT id, username, display_name FROM users WHERE username LIKE ?').get('%' + req.params.username + '%');
    res.json(user || { error: 'not_found' });
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
