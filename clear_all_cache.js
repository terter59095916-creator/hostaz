const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-clear-all-cache', (req, res) => {
    const result = db.prepare("DELETE FROM app_settings WHERE key LIKE '%music%' OR key LIKE '%popular%' OR key LIKE '%ciliz%' OR key LIKE '%yt%'").run();
    res.json({ cleared: result.changes });
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
