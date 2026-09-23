const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-unban-one', (req, res) => {
    const result = db.prepare("DELETE FROM banned_devices WHERE device_id = \x27dev_mtde8ydl_wxtnr66i66_xqh5qpboq7\x27").run();
    res.json({ deleted: result.changes });
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
