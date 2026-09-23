const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.post('/api/admin/ban-device/:userId', authLib.requireAdmin, (req, res) => {
    const targetId = Number(req.params.userId);
    const bindings = db.prepare('SELECT device_id, ip_address FROM device_bindings WHERE user_id = ?').all(targetId);
    if (bindings.length === 0) return res.status(404).json({ error: 'no_device_found' });
    bindings.forEach(b => {
        try { db.prepare('INSERT OR REPLACE INTO banned_devices (device_id, ip_address, reason) VALUES (?, ?, ?)').run(b.device_id, b.ip_address, 'admin_ban'); } catch (e) {}
    });
    console.log('ADMIN: cihaz banlandi - user_id=' + targetId + ' cihaz sayi=' + bindings.length);
    res.json({ success: true, banned_count: bindings.length });
});
app.post('/api/admin/unban-device/:userId', authLib.requireAdmin, (req, res) => {
    const targetId = Number(req.params.userId);
    const bindings = db.prepare('SELECT device_id FROM device_bindings WHERE user_id = ?').all(targetId);
    bindings.forEach(b => { try { db.prepare('DELETE FROM banned_devices WHERE device_id = ?').run(b.device_id); } catch (e) {} });
    res.json({ success: true });
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
