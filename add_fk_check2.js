const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-check-fks2', (req, res) => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const results = [];
    tables.forEach(t => {
        try {
            const fks = db.prepare('PRAGMA foreign_key_list(' + t.name + ')').all();
            fks.forEach(fk => {
                if (fk.table === 'users') results.push({ table: t.name, column: fk.from });
            });
        } catch (e) {}
    });
    res.json(results);
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
