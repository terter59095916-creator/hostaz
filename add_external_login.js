const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/external-login', (req, res) => {
    try {
      const extId = req.query.ext_id;
      const name = req.query.name || '';
      const photo = req.query.photo || '';
      if (!extId) return res.status(400).send('ext_id lazimdir');
      let user = db.prepare('SELECT * FROM users WHERE external_id = ?').get(String(extId));
      if (!user) {
        const info = db.prepare('INSERT INTO users (username, display_name, avatar_data, external_id, game_registered) VALUES (?, ?, ?, ?, 1)')
          .run('ext_' + extId, name || ('ext_' + extId), photo || null, String(extId));
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
      }
      if (user.is_banned) {
        if (!(user.ban_until && new Date(user.ban_until) <= new Date())) {
          return res.status(403).send('Bu hesab banlanib');
        }
      }
      const token = jwt.sign({ id: user.id, username: user.username, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
      res.cookie('authToken', token, { maxAge: 30*24*60*60*1000, httpOnly: false });
      res.redirect('/profile-v2?t=' + token);
    } catch (e) {
      console.log('EXTERNAL-LOGIN-XETA: ' + e.message);
      res.status(500).send('Xeta bas verdi');
    }
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
