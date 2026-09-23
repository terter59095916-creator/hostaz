const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-recent-users', (req, res) => {
    const users = db.prepare("SELECT id, username, display_name, created_at FROM users WHERE created_at >= datetime('now', '-8 hours') ORDER BY created_at DESC").all();
    const result = users.map(u => {
        const binding = db.prepare('SELECT device_id, ip_address FROM device_bindings WHERE user_id = ?').get(u.id);
        return { id: u.id, name: u.display_name || u.username, created_at: u.created_at, ip: binding ? binding.ip_address : 'YOXDUR' };
    });
    res.json(result);
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
