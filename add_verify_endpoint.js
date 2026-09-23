const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "});// Sekil yuklemek (base64)";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const newRoute = `});
app.post('/api/profile/verify', authLib.requireUser, (req, res) => {
    const row = db.prepare('SELECT crystals, is_verified FROM users WHERE id = ?').get(req.user.id);
    if (!row) return res.status(404).json({ error: 'not_found' });
    if (row.is_verified) return res.json({ success: true, already_verified: true });
    if ((row.crystals || 0) < 1000) return res.status(400).json({ error: 'insufficient_crystals' });
    db.prepare('UPDATE users SET crystals = crystals - 1000, is_verified = 1 WHERE id = ?').run(req.user.id);
    res.json({ success: true });
});// Sekil yuklemek (base64)`;
  c = c.replace(marker, newRoute);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
