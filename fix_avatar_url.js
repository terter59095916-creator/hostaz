const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = `app.get('/api/avatar/:id', (req, res) => {
    const user = db.prepare('SELECT avatar_data FROM users WHERE id = ?').get(req.params.id);
    if (!user || !user.avatar_data) return res.status(404).send('No avatar');
    const matches = user.avatar_data.match(/^data:(image\\/\\w+);base64,(.+)$/);
    if (!matches) return res.status(400).send('Invalid avatar data');
    const buffer = Buffer.from(matches[2], 'base64');
    res.set('Content-Type', matches[1]);
    res.send(buffer);
});`;
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
const replacement = `app.get('/api/avatar/:id', (req, res) => {
    const user = db.prepare('SELECT avatar_data FROM users WHERE id = ?').get(req.params.id);
    if (!user || !user.avatar_data) return res.status(404).send('No avatar');
    if (user.avatar_data.startsWith('http://') || user.avatar_data.startsWith('https://')) {
        return res.redirect(user.avatar_data);
    }
    const matches = user.avatar_data.match(/^data:(image\\/\\w+);base64,(.+)$/);
    if (!matches) return res.status(400).send('Invalid avatar data');
    const buffer = Buffer.from(matches[2], 'base64');
    res.set('Content-Type', matches[1]);
    res.send(buffer);
});`;
if (idx !== -1) {
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
