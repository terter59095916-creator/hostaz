const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "// =====================\n// STATIC FILES & ROUTES";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const facebookRoute = `app.post('/api/facebook-login', async (req, res) => {
    try {
        const { access_token } = req.body || {};
        if (!access_token) return res.status(400).json({ error: 'access_token_required' });
        const fbRes = await fetch('https://graph.facebook.com/me?fields=id,name,email,picture.width(200).height(200)&access_token=' + encodeURIComponent(access_token));
        const fbData = await fbRes.json();
        if (!fbData.id) return res.status(401).json({ error: 'invalid_facebook_token' });
        const facebookId = fbData.id;
        const email = fbData.email || ('fb_' + facebookId);
        const name = fbData.name;
        const picture = fbData.picture && fbData.picture.data && fbData.picture.data.url;
        let user = db.prepare('SELECT * FROM users WHERE facebook_id = ?').get(facebookId);
        if (!user) {
            const info = db.prepare(
                'INSERT INTO users (username, display_name, avatar_data, facebook_id) VALUES (?, ?, ?, ?)'
            ).run(email, name || email, picture || null, facebookId);
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
            console.log('WS: Facebook ile yeni istifadeci qeydiyyati - ' + email);
        } else {
            if (picture && picture !== user.avatar_data) {
                db.prepare('UPDATE users SET avatar_data = ?, display_name = ? WHERE id = ?').run(picture, name || user.display_name, user.id);
            }
            console.log('WS: Facebook ile giris - ' + email);
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ message: 'login_successful', token, username: user.username });
    } catch (error) {
        console.error('Facebook login error:', error);
        res.status(401).json({ error: 'invalid_facebook_token' });
    }
});
`;
c = c.slice(0, idx) + facebookRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
