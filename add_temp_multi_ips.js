const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-top-multi-ips', (req, res) => {
    const rows = db.prepare(\`
        SELECT ip_address, COUNT(DISTINCT user_id) as account_count
        FROM device_bindings
        WHERE ip_address IS NOT NULL AND ip_address != ''
        GROUP BY ip_address
        HAVING account_count > 1
        ORDER BY account_count DESC
        LIMIT 30
    \`).all();
    const withUsers = rows.map(r => {
        const users = db.prepare('SELECT db.user_id, u.username, u.display_name FROM device_bindings db JOIN users u ON u.id = db.user_id WHERE db.ip_address = ?').all(r.ip_address);
        return { ip_address: r.ip_address, account_count: r.account_count, users };
    });
    res.json(withUsers);
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
