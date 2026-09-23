const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.delete('/api/admin/users/:id', authLib.requireAdmin, (req, res) => {
    const targetId = Number(req.params.id);
    try {
        const tablesWithUserId = ['messages', 'friendships', 'follows', 'visited_rooms', 'device_bindings', 'photos', 'shorts', 'short_likes', 'short_comments', 'notifications', 'played_together', 'harem_ownership', 'profile_views', 'posts', 'post_likes', 'post_comments', 'photo_comments', 'harem_inbox'];
        const deleteTx = db.transaction(() => {
            tablesWithUserId.forEach(table => {
                try {
                    const cols = db.prepare('PRAGMA table_info(' + table + ')').all().map(c => c.name);
                    ['user_id', 'sender_id', 'receiver_id', 'target_id', 'viewer_id', 'viewed_id', 'friend_id', 'follower_id', 'followed_id', 'fellow_id', 'from_user_id', 'new_owner_id', 'old_owner_id'].forEach(col => {
                        if (cols.includes(col)) {
                            db.prepare('DELETE FROM ' + table + ' WHERE ' + col + ' = ?').run(targetId);
                        }
                    });
                } catch (e) {}
            });
            db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
        });
        deleteTx();
        console.log('ADMIN: istifadeci silindi - id=' + targetId);
        res.json({ success: true });
    } catch (e) {
        console.error('Istifadeci silme xetasi:', e.message);
        res.status(500).json({ error: e.message });
    }
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
