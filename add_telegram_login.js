const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.post('/api/facebook-login'";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const telegramRoute = `app.post('/api/telegram-login', async (req, res) => {
    try {
        const data = req.body || {};
        const { hash, id, first_name, last_name, username, photo_url, auth_date } = data;
        if (!hash || !id) return res.status(400).json({ error: 'invalid_telegram_data' });
        const crypto = require('crypto');
        const BOT_TOKEN = '8904330913:AAEsBE5MGsPL9kETTlo_chNpcQJIwTlhwmM';
        const checkFields = Object.keys(data).filter(k => k !== 'hash').sort();
        const checkString = checkFields.map(k => k + '=' + data[k]).join('\\n');
        const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
        const computedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
        if (computedHash !== hash) return res.status(401).json({ error: 'invalid_telegram_hash' });
        if (auth_date && (Date.now() / 1000 - auth_date) > 86400) return res.status(401).json({ error: 'telegram_data_expired' });
        const telegramId = String(id);
        const displayName = [first_name, last_name].filter(Boolean).join(' ') || username || ('tg_' + telegramId);
        let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
        if (!user) {
            const info = db.prepare(
                'INSERT INTO users (username, display_name, avatar_data, telegram_id) VALUES (?, ?, ?, ?)'
            ).run('tg_' + telegramId, displayName, photo_url || null, telegramId);
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
            console.log('WS: Telegram ile yeni istifadeci qeydiyyati - ' + displayName);
        } else {
            if (photo_url && photo_url !== user.avatar_data) {
                db.prepare('UPDATE users SET avatar_data = ?, display_name = ? WHERE id = ?').run(photo_url, displayName, user.id);
            }
            console.log('WS: Telegram ile giris - ' + displayName);
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ message: 'login_successful', token, username: user.username });
    } catch (error) {
        console.error('Telegram login error:', error);
        res.status(401).json({ error: 'invalid_telegram_data' });
    }
});
`;
c = c.slice(0, idx) + telegramRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
