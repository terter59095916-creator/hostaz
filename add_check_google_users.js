const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-check-google-users', (req, res) => {
    const rows = db.prepare("SELECT id, username, display_name, gender, avatar_data, google_id FROM users WHERE google_id IS NOT NULL LIMIT 10").all();
    res.json(rows.map(r => ({ id: r.id, username: r.username, display_name: r.display_name, gender: r.gender, has_avatar: Boolean(r.avatar_data), avatar_preview: r.avatar_data ? r.avatar_data.substring(0, 60) : null })));
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
