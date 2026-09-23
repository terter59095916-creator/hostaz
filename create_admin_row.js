const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-create-admin-row', (req, res) => {
    try {
      const hash = bcrypt.hashSync('88887777', 10);
      const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get('kissaz');
      if (existing) {
        db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').run(hash, 'kissaz');
      } else {
        db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('kissaz', hash);
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
