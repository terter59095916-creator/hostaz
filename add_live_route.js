const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/live-v2', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(__dirname, 'live_v2.html'));
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
