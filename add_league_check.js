const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-check-league/:username', (req, res) => {
    const user = db.prepare('SELECT id, username, league_tier, daily_league_score, daily_league_date FROM users WHERE username LIKE ?').get('%' + req.params.username + '%');
    res.json(user || { error: 'not_found' });
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
