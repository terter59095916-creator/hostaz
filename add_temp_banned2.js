const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-check-banned2', (req, res) => {
    const rows = db.prepare('SELECT * FROM banned_devices ORDER BY banned_at DESC LIMIT 20').all();
    res.json(rows);
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
