/*
 * ===================================================================
 * BU SKRIPT ureyimsen.com SAYTINA MEXSUSDUR
 * Bu kod, ureyimsen.com terefinden aylik icareye verilib.
 * Icazesiz kopyalanmasi, satilmasi ve ya yenidenpaylanmasi qadagandir.
 * © ureyimsen.com - Butun huquqlar qorunur.
 * ===================================================================
 */
// server.js ÔÇö ãÅsas server: HTTP (Express) + Socket.io + Admin API + Auth & Config API

require('dotenv').config();

// Kiraye Railway xidmetinin icazeli domeni Railway Variables-de LEASED_DOMAIN
// kimi saxlanir. Vergulle bir nece domen yazmaq olar.
const ALLOWED_ORIGINS = process.env.LEASED_DOMAIN
  ? process.env.LEASED_DOMAIN.split(',').map(domain => domain.trim()).filter(Boolean)
  : ['https://renewed-growth-production-ba28.up.railway.app'];

const express = require('express');
const compression = require('compression');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const WebSocket = require('ws');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client('47413688547-qug79v2eb2ld23hk1siq3eo4gdkbkoql.apps.googleusercontent.com');

const db = require('./db');
const game = require('./game');
const authLib = require('./auth');
const ytsr = require('@distube/ytsr');
process.on('unhandledRejection', (reason) => { console.error('UNHANDLED-REJECTION (server crash qarsisi alindi):', reason && reason.message ? reason.message : reason); });
process.on('uncaughtException', (err) => { console.error('UNCAUGHT-EXCEPTION (server crash qarsisi alindi):', err && err.message ? err.message : err); });
const { Innertube } = require('youtubei.js');
let innertubePromise = null;
function getInnertube() {
  if (!innertubePromise) innertubePromise = Innertube.create({ lang: 'az', location: 'AZ' });
  return innertubePromise;
}


const app = express();

app.get('/api/test123', (req, res) => { res.send('TEST ISLEYIR'); });
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: '100mb' }));

// =====================
// AUTH & CONFIG API
// =====================

// Oyun konfiqurasiyas─▒
const gameConfig = {
  "assets": {
    "url": "https://butilochka.cdnvideo.ru/mobile/assets.json?c9c6c5dbd89e12cc",
    "images_url": "http://bottlegae-1347.ciliz.com/"
  }
};

// M├╝v╔Öqq╔Öti istifad╔Ö├ği yadda┼ş─▒
const usersList = [];
const JWT_SECRET = authLib.JWT_SECRET;

// config m╔Ölumat─▒n─▒ qaytaran API
app.get('/api/config', (req, res) => {
    res.json(gameConfig);
});

// ─░stifad╔Ö├ği Qeydiyyat─▒ (Register)
function getClientIp(req) {
    const cfIp = req.headers['cf-connecting-ip'];
    if (cfIp) return cfIp.trim();
    const xff = req.headers['x-forwarded-for'];
    if (xff) return xff.split(',')[0].trim();
    return req.ip || (req.connection && req.connection.remoteAddress) || '';
}
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, gender, birthdate, device_id } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ error: 'username_and_password_required' });
        }
        const clientIp = getClientIp(req);
        if (device_id) {
            const bannedDev = db.prepare('SELECT * FROM banned_devices WHERE device_id = ?').get(device_id);
            if (bannedDev) return res.status(403).json({ error: 'device_banned' });
        }
        if (device_id) {
            const existingDevice = db.prepare('SELECT user_id FROM device_bindings WHERE device_id = ?').get(device_id);
            if (existingDevice) {
                return res.status(403).json({ error: 'device_already_used' });
            }
        }
        const result = authLib.registerUser(username, password, username, gender, birthdate);
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        const newUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        if (newUser && device_id) {
            try { db.prepare('INSERT INTO device_bindings (device_id, user_id, ip_address) VALUES (?, ?, ?)').run(device_id, newUser.id, clientIp); } catch (e) {}
        }
        res.status(201).json({ message: 'registered_successfully' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'server_error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password, device_id } = req.body || {};
        if (device_id) {
            const bannedDev = db.prepare('SELECT * FROM banned_devices WHERE device_id = ?').get(device_id);
            if (bannedDev) return res.status(403).json({ error: 'device_banned' });
        }
        const user = authLib.verifyUser(username, password);
        if (!user) {
            return res.status(400).json({ error: 'invalid_credentials' });
        }
        if (device_id) {
            const existingDevice = db.prepare('SELECT user_id FROM device_bindings WHERE device_id = ?').get(device_id);
            if (existingDevice && existingDevice.user_id !== user.id) {
                return res.status(403).json({ error: 'device_already_used' });
            }
            if (!existingDevice) {
                try { db.prepare('INSERT INTO device_bindings (device_id, user_id, ip_address) VALUES (?, ?, ?)').run(device_id, user.id, getClientIp(req)); } catch (e) {}
            }
        }
        const token = authLib.issueUserToken(user);
        res.json({
            message: 'login_successful',
            token,
            user: { id: user.id, username: user.username, points: user.points, coins: user.coins, crystals: user.crystals }
        });
    } catch (error) {
        if (error.code === 'BANNED') {
            return res.status(403).json({ error: 'user_banned', ban_until: error.banUntil });
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'server_error' });
    }
});
// Xal-i coin-e cevirmek (magaza)
app.post('/api/shop/buy-coins', authLib.requireUser, (req, res) => {
    try {
        const SHOP_RATES = { 10:0, 50:0, 100:10, 200:40, 500:150, 1000:350, 5000:1750 };
        const price = Number((req.body || {}).amount);
        if (!Number.isFinite(price) || !(price in SHOP_RATES)) {
            return res.status(400).json({ error: 'invalid_params' });
        }
        const bonus = SHOP_RATES[price];
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
        if (!user) return res.status(404).json({ error: 'not_found' });
        if (user.crystals < price) return res.status(400).json({ error: 'insufficient_crystals' });
        const coinsToAdd = price + bonus;
        db.prepare('UPDATE users SET crystals = crystals - ?, coins = coins + ? WHERE id = ?').run(price, coinsToAdd, user.id);
        db.prepare("INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'crystals', ?, 'shop_buy_coins')").run(user.id, -price);
        db.prepare("INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'coins', ?, 'shop_buy_coins')").run(user.id, coinsToAdd);
        res.json({ success: true, coins_added: coinsToAdd });
    } catch (error) {
        console.error('shop/buy-coins error:', error);
        res.status(500).json({ error: 'server_error' });
    }
});
app.post('/api/game/purchase-gold', authLib.requireUser, (req, res) => {
    try {
        const { gold, price } = req.body || {};
        if (typeof gold !== 'number' || typeof price !== 'number' || isNaN(gold) || isNaN(price) || gold <= 0 || price <= 0) {
            return res.status(400).json({ error: 'invalid_params' });
        }
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
        if (!user) return res.status(404).json({ error: 'not_found' });
        if (user.crystals < price) return res.status(400).json({ error: 'insufficient_crystals' });

        db.prepare('UPDATE users SET crystals = crystals - ?, coins = coins + ?, updated_at = datetime(\'now\') WHERE id = ?')
          .run(price, gold, user.id);
        db.prepare(
          `INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'crystals', ?, 'gold_purchase')`
        ).run(user.id, -price);
        db.prepare(
          `INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'coins', ?, 'gold_purchase')`
        ).run(user.id, gold);

        const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
        res.json({ success: true, crystals: updated.crystals, coins: updated.coins });
    } catch (error) {
        console.error('purchase-gold error:', error);
        res.status(500).json({ error: 'server_error' });
    }
});
// Profil melumatlarini gotur
app.get('/api/profile/me', authLib.requireUser, (req, res) => {
    const user = db.prepare('SELECT id, username, display_name, points, coins, crystals, avatar_data, user_status, user_status_set_at, is_verified, gender FROM users WHERE id = ?').get(req.user.id);
    user.user_status = getActiveStatus(user);
    res.json(user);
});
// Ad deyisdirmek
app.post('/api/profile/name', authLib.requireUser, (req, res) => {
    const { display_name } = req.body || {};
    if (!display_name || display_name.length > 30) return res.status(400).json({ error: 'invalid_name' });
    db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(display_name, req.user.id);
    res.json({ success: true, display_name });
});
app.post('/api/profile/change-password', authLib.requireUser, (req, res) => {
    const { current_password, new_password } = req.body || {};
    if (!current_password || !new_password || new_password.length < 6) {
        return res.status(400).json({ error: 'invalid_password' });
    }
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user || !bcrypt.compareSync(current_password, user.password_hash)) {
        return res.status(400).json({ error: 'wrong_current_password' });
    }
    const newHash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);
    res.json({ success: true });
});
app.post('/api/profile/status', authLib.requireUser, (req, res) => {
    const { status } = req.body || {};
    if (typeof status !== 'string' || status.length > 30) return res.status(400).json({ error: 'invalid_status' });
    db.prepare("UPDATE users SET user_status = ?, user_status_set_at = datetime('now') WHERE id = ?").run(status, req.user.id);
    res.json({ success: true, status });
});
app.post('/api/profile/verify', authLib.requireUser, (req, res) => {
    const row = db.prepare('SELECT crystals, is_verified FROM users WHERE id = ?').get(req.user.id);
    if (!row) return res.status(404).json({ error: 'not_found' });
    if (row.is_verified) return res.json({ success: true, already_verified: true });
    if ((row.crystals || 0) < 1000) return res.status(400).json({ error: 'insufficient_crystals' });
    db.prepare('UPDATE users SET crystals = crystals - 1000, is_verified = 1 WHERE id = ?').run(req.user.id);
    res.json({ success: true });
});// Sekil yuklemek (base64)
app.post('/api/profile/details', authLib.requireUser, (req, res) => {
    const { age, gender } = req.body || {};
    if (age !== undefined && age !== null && (age < 13 || age > 99)) return res.status(400).json({ error: 'invalid_age' });
    if (gender !== undefined && gender !== null && ['male','female'].indexOf(gender) < 0) return res.status(400).json({ error: 'invalid_gender' });
    db.prepare('UPDATE users SET age = COALESCE(?, age), gender = COALESCE(?, gender) WHERE id = ?').run(age ?? null, gender ?? null, req.user.id);
    res.json({ success: true });
});
app.post('/api/profile/avatar', authLib.requireUser, (req, res) => {
    const { avatar_data } = req.body || {};
    if (!avatar_data || avatar_data.length > 2000000) return res.status(400).json({ error: 'invalid_avatar' });
    db.prepare('UPDATE users SET avatar_data = ? WHERE id = ?').run(avatar_data, req.user.id);
    res.json({ success: true });
});
// Avatari HTTP ile gostermek (WebSocket mesaj olcusu limitine dusmemek ucun)
app.get('/api/avatar/:id', (req, res) => {
    const user = db.prepare('SELECT avatar_data FROM users WHERE id = ?').get(req.params.id);
    if (!user || !user.avatar_data) return res.status(404).send('No avatar');
    if (user.avatar_data.startsWith('http://') || user.avatar_data.startsWith('https://')) {
        return res.redirect(user.avatar_data);
    }
    const matches = user.avatar_data.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) return res.status(400).send('Invalid avatar data');
    const buffer = Buffer.from(matches[2], 'base64');
    res.set('Content-Type', matches[1]);
    res.send(buffer);
});
// Google ile giris
app.post('/api/google-login', async (req, res) => {
    try {
        const { credential, device_id } = req.body || {};
        if (!credential) return res.status(400).json({ error: 'credential_required' });
        if (device_id) {
          const bannedDevG = db.prepare('SELECT * FROM banned_devices WHERE device_id = ?').get(device_id);
          if (bannedDevG) return res.status(403).json({ error: 'device_banned' });
        }
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: '47413688547-qug79v2eb2ld23hk1siq3eo4gdkbkoql.apps.googleusercontent.com'
        });
        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        const picture = payload['picture'];
        let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
        if (user && user.is_banned) {
          if (user.ban_until && new Date(user.ban_until) <= new Date()) {
            db.prepare('UPDATE users SET is_banned=0, ban_until=NULL WHERE id=?').run(user.id);
          } else {
            return res.status(403).json({ error: 'user_banned', ban_until: user.ban_until });
          }
        }
        if (!user) {
            if (device_id) {
              const existingDevG = db.prepare('SELECT user_id FROM device_bindings WHERE device_id = ?').get(device_id);
              if (existingDevG) return res.status(403).json({ error: 'device_already_used' });
            }
            const info = db.prepare(
                'INSERT INTO users (username, display_name, avatar_data, google_id) VALUES (?, ?, ?, ?)'
            ).run(email, name || email, picture || null, googleId);
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
            if (device_id) { try { db.prepare('INSERT INTO device_bindings (device_id, user_id, ip_address) VALUES (?, ?, ?)').run(device_id, user.id, getClientIp(req)); } catch (e) {} }
            console.log('WS: Google ile yeni istifadeci qeydiyyati - ' + email);
        } else {
            console.log('WS: Google ile giris - ' + email);
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
        res.json({
            message: 'login_successful',
            token,
            username: user.username
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({ error: 'invalid_google_token' });
    }
});

// =====================
// STATIC FILES & ROUTES
// =====================

// Admin panel
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin'), { etag: false, lastModified: false, setHeaders: (res) => { res.set('Cache-Control', 'no-store, no-cache, must-revalidate'); } }));

// Yeni oyunun qovlu─şu
const GAME_DIR = path.join(
    __dirname,
    'butilochka.cdnvideo.ru',
    'bottle',
    'html'
);

// Oyunun mobile qovlu─şunu da servis et (burada server.json var)
app.use(express.static(path.join(__dirname, 'butilochka.cdnvideo.ru', 'mobile')));

// Manifest v╔Ö favicon qovlu─şunu da servis et
app.use(express.static(path.join(__dirname, 'favicon')));

// Login sehifesini gostermek ucun marsrut
app.get('/login', (req, res) => {
    res.redirect('/login-v2');
});
app.get('/api/game-rooms', (req, res) => {
    const list = [];
    for (const room of rooms.values()) {
        let male = 0, female = 0;
        room.players.forEach(p => { if (p.male) male++; else female++; });
        list.push({ id: room.gameId, total: room.players.size, male, female, max: MAX_SEATS });
    }
    list.sort((a, b) => a.id - b.id);
    res.json(list);
});
app.get('/api/temp-check-visited', (req, res) => {
    const rows = db.prepare('SELECT * FROM visited_rooms ORDER BY last_visited_at DESC LIMIT 30').all();
    res.json(rows);
});
app.get('/api/temp-find-user/:username', (req, res) => {
    const user = db.prepare('SELECT id, username, display_name FROM users WHERE username LIKE ?').get('%' + req.params.username + '%');
    res.json(user || { error: 'not_found' });
});
app.get('/api/temp-check-league/:username', (req, res) => {
    const user = db.prepare('SELECT id, username, league_tier, daily_league_score, daily_league_date FROM users WHERE username LIKE ?').get('%' + req.params.username + '%');
    res.json(user || { error: 'not_found' });
});
app.get('/api/temp-check-owned/:username', (req, res) => {
    const user = db.prepare('SELECT id, username, owned_items FROM users WHERE username LIKE ?').get('%' + req.params.username + '%');
    res.json(user || { error: 'not_found' });
});
app.get('/api/assets-proxy', async (req, res) => {
    try {
        const upstreamRes = await fetch('https://butilochka.cdnvideo.ru/mobile/assets.json?c9c6c5dbd89e12cc');
        const json = await upstreamRes.json();
        if (json.bottles && Array.isArray(json.bottles.__store)) {
            const existingIds = new Set(json.bottles.__store.map(b => b.id));
            const allBottleKeys = Object.keys(json.bottles).filter(k => k !== '__store');
            allBottleKeys.forEach(key => {
                if (!existingIds.has(key)) {
                    json.bottles.__store.push({ id: key });
                }
            });
            console.log('WS: assets-proxy - sise sayi genisleneildi, yeni __store uzunlugu=' + json.bottles.__store.length);
        }
        if (json.gifts) {
            const skipKeys = ['id','type'];
            const allGiftKeys = Object.keys(json.gifts).filter(k => !k.startsWith('__store') && k !== '__store');
            const storeVersionKeys = Object.keys(json.gifts).filter(k => k.startsWith('__store_v'));
            storeVersionKeys.forEach(storeKey => {
                if (Array.isArray(json.gifts[storeKey])) {
                    const existingIds = new Set(json.gifts[storeKey].map(g => g.id));
                    allGiftKeys.forEach(key => {
                        if (!existingIds.has(key)) {
                            json.gifts[storeKey].push({ id: key });
                        }
                    });
                }
            });
            if (Array.isArray(json.gifts.__store)) {
                const existingIds0 = new Set(json.gifts.__store.map(g => g.id));
                allGiftKeys.forEach(key => {
                    if (!existingIds0.has(key)) json.gifts.__store.push({ id: key });
                });
            }
            console.log('WS: assets-proxy - hediyye store versiyalari genislenildi: ' + storeVersionKeys.join(','));
        }
        if (json.achievement) {
          Object.keys(json.achievement).forEach(k => {
            const ach = json.achievement[k];
            if (ach.counters && Array.isArray(ach.counters)) {
              ach.counters = ach.counters.map(n => (typeof n === 'number') ? Math.round(n * 2) : n);
            }
          });
          console.log('WS: assets-proxy - nailiyyet heddleri 2x cetinlesdirildi');
        }
        try {
          require('fs').writeFileSync(require('path').join(__dirname, 'game-assets', 'assets.json'), JSON.stringify(json));
          console.log('WS: assets-proxy - lokal fayl yenilendi');
        } catch (saveErr) {
          console.error('assets-proxy lokal saxlama xetasi:', saveErr.message);
        }
        res.set('Content-Type', 'application/json');
        res.set('Cache-Control', 'no-store');
        res.send(JSON.stringify(json));
    } catch (e) {
        console.error('assets-proxy xetasi:', e.message);
        res.status(500).json({ error: 'proxy_failed' });
    }
});
app.get('/live-v2', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(__dirname, 'live_v2.html'));
});
app.get('/api/temp-check-live', (req, res) => {
    const list = [];
    liveStreamsMap.forEach((s) => {
        const host = s.seats.get(s.hostId);
        list.push({ id: s.id, name: host ? host.name : '', viewers: s.viewers.size, wsOpen: Boolean(host && host.ws.readyState === 1), pk: Boolean(s.pk) });
    });
    res.json(list);
});
const livePhotosMap = new Map();
let nextLivePhotoId = 1;
app.post('/api/live-photo-upload', authLib.requireUser, (req, res) => {
    const { photo_data } = req.body || {};
    if (!photo_data) return res.status(400).json({ error: 'no_photo' });
    const photoId = nextLivePhotoId++;
    livePhotosMap.set(photoId, photo_data);
    setTimeout(() => livePhotosMap.delete(photoId), 4 * 60 * 60 * 1000);
    res.json({ photo_url: '/api/live-photo/' + photoId });
});
app.get('/api/live-photo/:id', (req, res) => {
    const data = livePhotosMap.get(Number(req.params.id));
    if (!data) return res.status(404).send('not found');
    const matches = data.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) return res.status(400).send('invalid');
    res.set('Content-Type', matches[1]);
    res.send(Buffer.from(matches[2], 'base64'));
});
app.post('/api/buy-tokens', authLib.requireUser, (req, res) => {
    const amount = Number((req.body || {}).crystal_amount);
    if (!amount || amount < 1) return res.status(400).json({ error: 'invalid_amount' });
    const user = db.prepare('SELECT crystals FROM users WHERE id = ?').get(req.user.id);
    if (!user || user.crystals < amount) return res.status(400).json({ error: 'insufficient_crystals' });
    const tokensGained = amount * 10;
    db.prepare('UPDATE users SET crystals = crystals - ?, live_tokens = live_tokens + ? WHERE id = ?').run(amount, tokensGained, req.user.id);
    const updated = db.prepare('SELECT crystals, live_tokens FROM users WHERE id = ?').get(req.user.id);
    res.json({ success: true, crystals: updated.crystals, live_tokens: updated.live_tokens });
});
const liveGiftEffectMap = new Map(require('./live-gift-effects.json').map(item => [String(item.gift_id), Number(item.effect_id)]));
const liveGiftCatalog = require('./tiktok_gift_catalog_full.json');
const liveGiftCatalogMap = new Map(liveGiftCatalog.map(gift => [String(gift.id), gift]));
const giftMediaEntitlements = new Map();
const giftMediaTickets = new Map();
const giftMediaRate = new Map();
const giftCatalogRate = new Map();
function requireSameSiteBrowser(req, res, next) {
    const fetchSite = String(req.headers['sec-fetch-site'] || '');
    const origin = String(req.headers.origin || '');
    const allowedOrigins = new Set(ALLOWED_ORIGINS);
    if (fetchSite !== 'same-origin' && !allowedOrigins.has(origin)) return res.status(403).json({ error: 'browser_origin_required' });
    next();
}
function giftMediaKey(userId, effectId) { return String(userId) + ':' + String(effectId); }
function grantGiftMedia(stream, effectId) {
    if (!stream || !effectId) return;
    const expires = Date.now() + 25000;
    stream.seats.forEach(seat => giftMediaEntitlements.set(giftMediaKey(seat.userId, effectId), expires));
    stream.viewers.forEach(userId => {
        if (Number.isFinite(Number(userId))) giftMediaEntitlements.set(giftMediaKey(userId, effectId), expires);
    });
}
function allowGiftMediaRequest(userId) {
    const now = Date.now(), old = giftMediaRate.get(String(userId)) || [];
    const fresh = old.filter(ts => now - ts < 60000);
    if (fresh.length >= 15) return false;
    fresh.push(now); giftMediaRate.set(String(userId), fresh); return true;
}
const giftProtectionCleanup = setInterval(() => {
    const now = Date.now();
    giftMediaEntitlements.forEach((expires, key) => { if (expires < now) giftMediaEntitlements.delete(key); });
    giftMediaTickets.forEach((grant, key) => { if (grant.expiresAt < now) giftMediaTickets.delete(key); });
    giftMediaRate.forEach((items, key) => { const fresh = items.filter(ts => now - ts < 60000); fresh.length ? giftMediaRate.set(key, fresh) : giftMediaRate.delete(key); });
    giftCatalogRate.forEach((items, key) => { const fresh = items.filter(ts => now - ts < 60000); fresh.length ? giftCatalogRate.set(key, fresh) : giftCatalogRate.delete(key); });
}, 60000);
if (giftProtectionCleanup.unref) giftProtectionCleanup.unref();
app.post('/api/live-gift-media-ticket/:effectId', authLib.requireUser, requireSameSiteBrowser, (req, res) => {
    const effectId = Number(req.params.effectId);
    const key = giftMediaKey(req.user.id, effectId);
    const entitlement = giftMediaEntitlements.get(key) || 0;
    if (!effectId || entitlement < Date.now()) return res.status(403).json({ error: 'effect_not_authorized' });
    if (!allowGiftMediaRequest(req.user.id)) return res.status(429).json({ error: 'too_many_media_requests' });
    const ticket = crypto.randomBytes(24).toString('base64url');
    giftMediaTickets.set(ticket, { userId: Number(req.user.id), effectId, expiresAt: Date.now() + 12000 });
    giftMediaEntitlements.delete(key);
    res.set('Cache-Control', 'no-store');
    res.json({ ticket, expires_in_ms: 12000 });
});
app.get('/api/live-gift-media/:effectId', authLib.requireUser, requireSameSiteBrowser, (req, res) => {
    const effectId = Number(req.params.effectId), ticket = String(req.query.ticket || '');
    const grant = giftMediaTickets.get(ticket);
    giftMediaTickets.delete(ticket);
    if (!grant || grant.expiresAt < Date.now() || grant.userId !== Number(req.user.id) || grant.effectId !== effectId) {
        return res.status(403).json({ error: 'invalid_or_expired_ticket' });
    }
    const file = path.join(__dirname, 'public', 'live-gift-videos', 'effect-' + effectId + '.mp4');
    if (!require('fs').existsSync(file)) return res.status(404).json({ error: 'effect_not_found' });
    res.set({ 'Cache-Control': 'no-store, private', 'Pragma': 'no-cache', 'Accept-Ranges': 'none',
        'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'same-origin',
        'Content-Disposition': 'inline', 'Content-Type': 'video/mp4' });
    res.sendFile(file, { acceptRanges: false, cacheControl: false });
});
app.get('/api/live-gifts-catalog', authLib.requireUser, requireSameSiteBrowser, (req, res) => {
    try {
        const now = Date.now(), key = String(req.user.id), old = giftCatalogRate.get(key) || [];
        const fresh = old.filter(ts => now - ts < 60000);
        if (fresh.length >= 3) return res.status(429).json({ error: 'catalog_rate_limited' });
        fresh.push(now); giftCatalogRate.set(key, fresh);
        const catalog = Array.from(liveGiftCatalogMap.values()).map(g => {
            const effectId = liveGiftEffectMap.get(String(g.id)) || null;
            return { id: g.id, name: g.name, image: g.icon, price: g.diamond_count, combo: g.combo,
                effect_id: effectId, has_animation: Boolean(effectId) };
        });
        res.set({ 'Cache-Control': 'no-store, private', 'Pragma': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
        res.json(catalog);
    } catch (e) { console.log('LIVE-GIFTS-CATALOG-XETA: ' + e.message); res.status(500).json({ error: 'catalog_error' }); }
});
app.get('/api/my-tokens', authLib.requireUser, (req, res) => {
    const user = db.prepare('SELECT live_tokens, crystals, gift_level_score FROM users WHERE id = ?').get(req.user.id);
    res.json(user || { live_tokens: 0, crystals: 0, gift_level_score: 0 });
});
app.delete('/api/admin/users/:id', authLib.requireAdmin, (req, res) => {
    const targetId = Number(req.params.id);
    try {
        const tablesWithUserId = ['messages', 'friendships', 'follows', 'visited_rooms', 'device_bindings', 'photos', 'shorts', 'short_likes', 'short_comments', 'notifications', 'played_together', 'harem_ownership', 'profile_views', 'posts', 'post_likes', 'post_comments', 'photo_comments', 'harem_inbox', 'transactions'];
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
        console.log('ADMIN: istifadeci silindi - id=' + targetId);
        res.json({ success: true });
    } catch (e) {
        console.error('Istifadeci silme xetasi:', e.message);
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/admin/related-accounts/:userId', authLib.requireAdmin, (req, res) => {
    const targetId = Number(req.params.userId);
    const myBindings = db.prepare('SELECT ip_address FROM device_bindings WHERE user_id = ?').all(targetId);
    const ips = myBindings.map(b => b.ip_address).filter(Boolean);
    if (ips.length === 0) return res.json([]);
    const placeholders = ips.map(() => '?').join(',');
    const relatedBindings = db.prepare('SELECT DISTINCT user_id FROM device_bindings WHERE ip_address IN (' + placeholders + ') AND user_id != ?').all(...ips, targetId);
    const relatedIds = relatedBindings.map(r => r.user_id);
    if (relatedIds.length === 0) return res.json([]);
    const idPlaceholders = relatedIds.map(() => '?').join(',');
    const users = db.prepare('SELECT id, username, display_name, is_banned FROM users WHERE id IN (' + idPlaceholders + ')').all(...relatedIds);
    res.json(users);
});
app.post('/api/admin/ban-device/:userId', authLib.requireAdmin, (req, res) => {
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
app.get('/api/temp-check-devices', (req, res) => {
    const rows = db.prepare('SELECT * FROM device_bindings ORDER BY bound_at DESC LIMIT 20').all();
    res.json(rows);
});
app.get('/api/temp-top-multi-ips', (req, res) => {
    const rows = db.prepare(`
        SELECT ip_address, COUNT(DISTINCT user_id) as account_count
        FROM device_bindings
        WHERE ip_address IS NOT NULL AND ip_address != ''
        GROUP BY ip_address
        HAVING account_count > 1
        ORDER BY account_count DESC
        LIMIT 30
    `).all();
    const withUsers = rows.map(r => {
        const users = db.prepare('SELECT db.user_id, u.username, u.display_name FROM device_bindings db JOIN users u ON u.id = db.user_id WHERE db.ip_address = ?').all(r.ip_address);
        return { ip_address: r.ip_address, account_count: r.account_count, users };
    });
    res.json(withUsers);
});
app.get('/api/temp-recent-users', (req, res) => {
    const users = db.prepare("SELECT id, username, display_name, created_at FROM users WHERE created_at >= datetime('now', '-8 hours') ORDER BY created_at DESC").all();
    const result = users.map(u => {
        const binding = db.prepare('SELECT device_id, ip_address FROM device_bindings WHERE user_id = ?').get(u.id);
        return { id: u.id, name: u.display_name || u.username, created_at: u.created_at, ip: binding ? binding.ip_address : 'YOXDUR' };
    });
    res.json(result);
});
app.get('/api/temp-search-similar/:pattern', (req, res) => {
    const pattern = '%' + req.params.pattern + '%';
    const users = db.prepare('SELECT id, username, display_name, created_at FROM users WHERE username LIKE ? OR display_name LIKE ? ORDER BY created_at ASC').all(pattern, pattern);
    res.json(users);
});
app.get('/api/temp-check-fks2', (req, res) => {
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
app.get('/api/temp-check-pass-rewards', (req, res) => {
    const rows = db.prepare('SELECT * FROM pass_level_rewards WHERE free_boosters_json IS NOT NULL OR paid_boosters_json IS NOT NULL LIMIT 10').all();
    res.json(rows);
});
app.get('/api/temp-check-transactions', (req, res) => {
    const rows = db.prepare("SELECT * FROM transactions WHERE type IN ('dj_score_period','gestures_period','price_period') ORDER BY created_at DESC LIMIT 20").all();
    res.json(rows);
});
app.get('/api/temp-check-banned2', (req, res) => {
    const rows = db.prepare('SELECT * FROM banned_devices ORDER BY banned_at DESC LIMIT 20').all();
    res.json(rows);
});
app.get('/api/temp-unban-one', (req, res) => {
    const result = db.prepare("DELETE FROM banned_devices WHERE device_id = 'dev_mtde8ydl_wxtnr66i66_xqh5qpboq7'").run();
    res.json({ deleted: result.changes });
});
app.get('/api/temp-unbind-user/:id', (req, res) => {
    const result = db.prepare('DELETE FROM device_bindings WHERE user_id = ?').run(Number(req.params.id));
    res.json({ deleted: result.changes });
});
app.get('/api/temp-check-kicked/:id', (req, res) => {
    const row = db.prepare('SELECT id, username, kicked_until, kicked_from_game_id FROM users WHERE id = ?').get(Number(req.params.id));
    res.json(row || {});
});
app.get('/api/temp-clear-kicked/:id', (req, res) => {
    db.prepare('UPDATE users SET kicked_until = NULL, kicked_from_game_id = NULL WHERE id = ?').run(Number(req.params.id));
    res.json({ success: true });
});
app.get('/api/temp-check-google-users', (req, res) => {
    const rows = db.prepare("SELECT id, username, display_name, gender, avatar_data, google_id FROM users WHERE google_id IS NOT NULL LIMIT 10").all();
    res.json(rows.map(r => ({ id: r.id, username: r.username, display_name: r.display_name, gender: r.gender, has_avatar: Boolean(r.avatar_data), avatar_preview: r.avatar_data ? r.avatar_data.substring(0, 60) : null })));
});
app.get('/api/temp-check-user-full/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
    if (row && row.avatar_data) row.avatar_data = row.avatar_data.substring(0, 50) + '...';
    if (row && row.password_hash) row.password_hash = '[hidden]';
    res.json(row || {});
});
app.get('/api/temp-repair-registration', (req, res) => {
    const result = db.prepare("UPDATE users SET game_registered = 1 WHERE gender IS NOT NULL OR google_id IS NOT NULL OR facebook_id IS NOT NULL OR telegram_id IS NOT NULL").run();
    res.json({ repaired: result.changes });
});
app.get('/api/temp-export-pass', (req, res) => {
    const rows = db.prepare('SELECT * FROM pass_level_rewards').all();
    res.json(rows);
});
app.get('/api/temp-set-admin-creds-main', (req, res) => {
    try {
      const hash = bcrypt.hashSync('12Mart1988', 10);
      const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get('qoca');
      if (existing) {
        db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').run(hash, 'qoca');
      } else {
        db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('qoca', hash);
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
});
app.get('/api/temp-fix-existing-admin', (req, res) => {
    try {
      const admins = db.prepare('SELECT * FROM admins').all();
      const hash = bcrypt.hashSync('12Mart1988', 10);
      if (admins.length > 0) {
        db.prepare('UPDATE admins SET username = ?, password_hash = ? WHERE id = ?').run('qoca', hash, admins[0].id);
        for (let i = 1; i < admins.length; i++) {
          db.prepare('DELETE FROM admins WHERE id = ?').run(admins[i].id);
        }
      } else {
        db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('qoca', hash);
      }
      res.json({ success: true, admins_before: admins.map(a => a.username) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
});
app.get('/api/external-login', (req, res) => {
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
      const passParam = req.query.pass;
      const reconstructedGulUrl = (extId && passParam) ? ('https://gul.az/chat/enter.php?id=' + extId + '&ps=' + encodeURIComponent(passParam)) : '';
      const returnUrl = reconstructedGulUrl || req.query.return_url || req.get('Referer') || '';
      const redirectUrl = '/profile-v2?t=' + token + (returnUrl ? '&return_url=' + encodeURIComponent(returnUrl) : '');
      res.redirect(redirectUrl);
    } catch (e) {
      console.log('EXTERNAL-LOGIN-XETA: ' + e.message);
      res.status(500).send('Xeta bas verdi');
    }
});
app.get('/login-v2', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(__dirname, 'login_v2.html'));
});
app.get('/profile-v2', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(__dirname, 'profile_v2.html'));
});
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'manifest.json'));
});
app.get('/privacy.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy.html'));
});
app.get('/feed', (req, res) => {
    res.sendFile(path.join(__dirname, 'feed.html'));
});
app.get('/friends', (req, res) => {
    res.sendFile(path.join(__dirname, 'friends.html'));
});
app.get('/messages', (req, res) => {
    res.sendFile(path.join(__dirname, 'messages.html'));
});
app.get('/photos', (req, res) => {
    res.sendFile(path.join(__dirname, 'photos.html'));
});
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});
app.get('/viewers', (req, res) => {
    res.sendFile(path.join(__dirname, 'viewers.html'));
});
app.get('/notifications', (req, res) => {
    res.sendFile(path.join(__dirname, 'notifications.html'));
});
app.get('/shorts', (req, res) => {
    res.sendFile(path.join(__dirname, 'shorts.html'));
});
app.get('/live', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(__dirname, 'live_v2.html'));
});
app.use('/room-assets', express.static(path.join(__dirname, 'room-assets'), { maxAge: '1h', index: false }));
app.get('/vendor/livekit-client-2.15.6.umd.min.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'vendor', 'livekit-client-2.15.6.umd.min.js'));
});
// Compatibility URLs for existing profile and room links.
app.get('/youtube-icon.png', (req, res) => res.sendFile(path.join(__dirname, 'room-assets', 'youtube-icon.png')));
app.get('/camera-icon.png', (req, res) => res.sendFile(path.join(__dirname, 'room-assets', 'camera-icon.png')));
app.get('/images.jpg', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(__dirname, 'room-assets', 'bottle.jpg'));
});
app.get('/share_img.png', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(__dirname, 'share_img.png'));
});
app.get('/rooms', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(__dirname, 'rooms.html'));
});
app.get('/api/rooms', async (req, res) => {
    const videoCounts = await videoRooms.counts(LIVE_ROOM_CATALOG.filter(room => room.isVideoCallRoom).map(room => room.id));
    const rooms = LIVE_ROOM_CATALOG.map(room => {
        const stream = getLiveRoomStream(room.id);
        return {
            ...room,
            viewerCount: room.isVideoCallRoom ? (videoCounts[room.id] || 0) : getNightRoomMemberCount(room.id) || (stream ? stream.viewers.size + stream.seats.size : 0),
            isLive: room.isVideoCallRoom ? Boolean(videoCounts[room.id]) : Boolean(stream),
            streamId: room.isVideoCallRoom ? null : stream ? stream.id : null,
            youtube: room.isVideoCallRoom ? null : getRoomYoutubeClip(room.id)
        };
    });
    res.set('Cache-Control', 'no-store');
    res.json({ rooms });
});
// Otağın gecə dizaynı ayrıca səhifədir. Kamera/PK canlısı yalnız bu səhifədəki düymə ilə açılır.
app.get('/room', (req, res) => {
    const roomId = normalizeLiveRoomId(req.query.id);
    if (!roomId) return res.redirect('/rooms');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    const room = LIVE_ROOM_CATALOG.find(item => item.id === roomId);
    res.sendFile(path.join(__dirname, room.isVideoCallRoom ? 'video_room.html' : 'night_room.html'));
});
app.get('/api/room/:id', async (req, res) => {
    const roomId = normalizeLiveRoomId(req.params.id);
    if (!roomId) return res.status(404).json({ error: 'room_not_found' });
    const room = LIVE_ROOM_CATALOG.find(item => item.id === roomId);
    const stream = getLiveRoomStream(roomId);
    res.set('Cache-Control', 'no-store');
    const videoCounts = room.isVideoCallRoom ? await videoRooms.counts([roomId]) : {};
    res.json({ ...room, viewerCount: room.isVideoCallRoom ? (videoCounts[roomId] || 0) : getNightRoomMemberCount(roomId) || (stream ? stream.viewers.size + stream.seats.size : 0), isLive: room.isVideoCallRoom ? Boolean(videoCounts[roomId]) : Boolean(stream), streamId: room.isVideoCallRoom ? null : stream ? stream.id : null, youtube: room.isVideoCallRoom ? null : getRoomYoutubeClip(roomId), maxSeats: NIGHT_ROOM_MAX_SEATS });
});
app.post('/api/room/:id/youtube', authLib.requireUser, (req, res) => {
    const roomId = normalizeLiveRoomId(req.params.id);
    if (!roomId) return res.status(404).json({ error: 'room_not_found' });
    if (LIVE_ROOM_CATALOG.find(room => room.id === roomId).isVideoCallRoom) return res.status(400).json({ error: 'video_room_has_no_clips' });
    const body = req.body || {};
    const videoId = normalizeYoutubeVideoId(body.video_id || body.videoId || body.url);
    if (!videoId) return res.status(400).json({ error: 'invalid_video_id' });
    try {
        const clip = saveRoomYoutubeClip(roomId, { videoId, title: body.title, singer: body.singer, song: body.song, addedBy: req.user.display_name || req.user.username, addedById: String(req.user.id), thumbnail: body.thumbnail });
        const stream = getLiveRoomStream(roomId);
        if (stream) liveBroadcast(stream, { type: 'room_youtube_updated', room_id: roomId, youtube: clip });
        res.json({ ok: true, youtube: clip });
    } catch (e) {
        res.status(500).json({ error: 'room_youtube_save_failed' });
    }
});
app.delete('/api/room/:id/youtube', authLib.requireUser, (req, res) => {
    const roomId = normalizeLiveRoomId(req.params.id);
    if (!roomId) return res.status(404).json({ error: 'room_not_found' });
    if (LIVE_ROOM_CATALOG.find(room => room.id === roomId).isVideoCallRoom) return res.status(400).json({ error: 'video_room_has_no_clips' });
    try {
        clearRoomYoutubeClip(roomId);
        const stream = getLiveRoomStream(roomId);
        if (stream) liveBroadcast(stream, { type: 'room_youtube_updated', room_id: roomId, youtube: null });
        res.json({ ok: true, youtube: null });
    } catch (e) {
        res.status(500).json({ error: 'room_youtube_clear_failed' });
    }
});
app.get('/api/live-rtc-config', authLib.requireUser, requireSameSiteBrowser, (req, res) => {
    const iceServers = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }];
    if (process.env.LIVE_TURN_URL && process.env.LIVE_TURN_USERNAME && process.env.LIVE_TURN_CREDENTIAL) {
        iceServers.push({
            urls: process.env.LIVE_TURN_URL.split(',').map(value => value.trim()).filter(Boolean),
            username: process.env.LIVE_TURN_USERNAME,
            credential: process.env.LIVE_TURN_CREDENTIAL
        });
    }
    res.set('Cache-Control', 'no-store, private');
    res.json({ iceServers });
});
app.get('/api/live/list', authLib.requireUser, (req, res) => {
    const list = [];
    liveStreamsMap.forEach((stream) => {
      const host = stream.seats.get(stream.hostId);
      list.push({ stream_id: stream.id, host_id: stream.hostId, host_name: host ? host.name : '',
        viewer_count: stream.viewers.size, mode: stream.mode, pk_active: Boolean(stream.pk) });
    });
    res.json(list);
});
app.get('/apple-touch-icon.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'apple-touch-icon.png'));
});
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'sw.js'));
});

// Register sehifesini gostermek ucun marsrut
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Ana s╔Öhif╔Ö -> daxil olan kimi avtomatik /login s╔Öhif╔Ösin╔Ö y├Ânl╔Öndirir
app.get('/', (req, res) => {
    res.redirect('/login-v2');
});

// Oyun s╔Öhif╔Ösi
app.get('/game', (req, res) => {
    res.redirect('/game-v2');
});
app.get('/api/temp-clear-search-cache', (req, res) => {
  try {
    const result = db.prepare("DELETE FROM app_settings WHERE key LIKE 'ytsearch_%' AND value = '[]'").run();
    res.json({ success: true, deleted: result.changes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get('/api/temp-grant-items', (req, res) => {
  try {
    const userId = req.query.userId;
    const item = req.query.item || 'kiss_fire';
    const count = Number(req.query.count) || 10000;
    const row = db.prepare('SELECT owned_items FROM users WHERE id = ?').get(userId);
    let owned = {};
    if (row && row.owned_items) { try { owned = JSON.parse(row.owned_items); } catch(e) {} }
    owned[item] = count;
    db.prepare('UPDATE users SET owned_items = ? WHERE id = ?').run(JSON.stringify(owned), userId);
    res.json({ success: true, owned });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get('/api/ciliz-direct/*', async (req, res) => {
  try {
    const targetPath = req.params[0];
    const qs = new URLSearchParams(req.query).toString();
    const targetUrl = `https://youtube.ciliz.com/` + targetPath + '?' + qs;
    const response = await fetch(targetUrl);
    const text = await response.text();
    console.log('CILIZ-DIRECT: ' + targetUrl + ' -> status ' + response.status);
    res.status(response.status).type('application/json').send(text);
  } catch (e) {
    console.log('CILIZ-DIRECT-XETA: ' + e.message);
    res.status(500).json([]);
  }
});
app.get('/api/ciliz-proxy/*', async (req, res) => {
  try {
    const targetPath = req.params[0];
    const qs = new URLSearchParams(req.query).toString();
    const targetUrl = `https://api-proxy.ciliz.com/` + targetPath + '?' + qs;
    const response = await fetch(targetUrl);
    const text = await response.text();
    console.log('CILIZ-PROXY: ' + targetUrl + ' -> status ' + response.status);
    res.status(response.status).type('application/json').send(text);
  } catch (e) {
    console.log('CILIZ-PROXY-XETA: ' + e.message);
    res.status(500).json([]);
  }
});
app.get('/game-v2', (req, res) => {
    res.sendFile(path.join(__dirname, 'game_v2', 'yandex_v2.html'));
});
app.use(express.static(path.join(__dirname, 'game_v2')));

// Oyunun dig╔Ör statik resurslar─▒n─▒ servis et (CSS, JS, media v╔Ö s.)
app.use(express.static(GAME_DIR));

// YouTube axtarish/musiqi proxy
app.get('/api/ciliz-music/search', async (req, res) => {
    console.log('CILIZ-MUSIC-SEARCH-CAGIRILDI: ' + req.query.query);
    try {
        const q = req.query.query || '';
        const count = req.query.count || 20;
        const cacheKey = 'cilizmusicsearch_' + q.toLowerCase().trim() + '_' + count;
        const cachedSearch = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(cacheKey);
        if (cachedSearch) {
            console.log('WS: ciliz-music axtarisi keshden - ' + q);
            return res.json(JSON.parse(cachedSearch.value));
        }
        let youtubeResults = [];
        try {
          const searchResult = await ytsr(q, { limit: Number(count) + 10 });
          console.log('YTSR-DEBUG: total_items=' + searchResult.items.length + ' types=' + JSON.stringify(searchResult.items.map(i => i.type)));
          const videos = searchResult.items.filter(item => item.type === 'video');
          youtubeResults = videos.slice(0, count).map(item => {
            const idMatch = item.url.match(/[?&]v=([^&]+)/);
            const videoId = idMatch ? idMatch[1] : item.id;
            const durParts = (item.duration || '0:00').split(':').map(Number);
            let durSec = 0;
            if (durParts.length === 3) durSec = durParts[0] * 3600 + durParts[1] * 60 + durParts[2];
            else if (durParts.length === 2) durSec = durParts[0] * 60 + durParts[1];
            return {
              artist: (item.author && item.author.name) || '',
              duration: durSec,
              id: videoId,
              title: item.title,
              url: item.url,
              provider: 'cz'
            };
          });
        } catch (ytErr) {
          console.log('WS: ytsr axtaris xetasi - ' + ytErr.message);
        }
        if (!youtubeResults || youtubeResults.length === 0) {
          try {
            const yt = await getInnertube();
            const itSearch = await yt.search(q, { type: 'video' });
            const itVideos = (itSearch.videos || []).slice(0, count);
            youtubeResults = itVideos.map(v => ({
              artist: (v.author && v.author.name) || '',
              duration: v.duration ? v.duration.seconds : 0,
              id: v.id,
              title: v.title ? v.title.text : '',
              url: 'https://www.youtube.com/watch?v=' + v.id,
              provider: 'cz'
            }));
            console.log('WS: youtubei.js elave etdi, say=' + youtubeResults.length);
          } catch (itErr) {
            console.log('WS: youtubei.js xetasi - ' + itErr.message);
          }
        }
        
        if (!youtubeResults || youtubeResults.length === 0) {
          youtubeResults = await searchVimeo(q, count);
        }
        if (!youtubeResults || youtubeResults.length === 0) {
          const apiKeyFallback = process.env.YOUTUBE_API_KEY;
          if (apiKeyFallback) {
            try {
              const urlFb = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${count}&q=${encodeURIComponent(q)}&key=${apiKeyFallback}`;
              const ytResFb = await fetch(urlFb);
              const dataFb = await ytResFb.json();
              if (dataFb.items && dataFb.items.length > 0) {
                const videoIdsFb = dataFb.items.map(item => item.id.videoId).join(',');
                const detailsUrlFb = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIdsFb}&key=${apiKeyFallback}`;
                const detailsResFb = await fetch(detailsUrlFb);
                const detailsDataFb = await detailsResFb.json();
                youtubeResults = (detailsDataFb.items || []).map(item => ({
                  artist: item.snippet.channelTitle || '',
                  duration: parseYoutubeDuration(item.contentDetails.duration),
                  id: item.id,
                  title: item.snippet.title,
                  url: 'https://www.youtube.com/watch?v=' + item.id,
                  provider: 'cz'
                }));
                console.log('WS: youtube-api fallback ile tapildi - ' + q + ' - ' + youtubeResults.length + ' dene');
              }
            } catch (fbErr) {
              console.log('WS: youtube-api fallback xetasi - ' + fbErr.message);
            }
          }
        }db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(cacheKey, JSON.stringify(youtubeResults));
        res.json(youtubeResults);
    } catch (error) {
        console.error('ciliz-music search error:', error);
        res.json([]);
    }
});
app.get('/api/admin/top10-debug', (req, res) => {
    const kisses = db.prepare('SELECT id, display_name, username, total_kisses FROM users ORDER BY total_kisses DESC LIMIT 10').all();
    const gestures = db.prepare('SELECT id, display_name, username, gestures_sent FROM users ORDER BY gestures_sent DESC LIMIT 10').all();
    const price = db.prepare('SELECT id, display_name, username, price_stat FROM users ORDER BY price_stat DESC LIMIT 10').all();
    const harem = db.prepare('SELECT id, display_name, username, harem_price_stat FROM users ORDER BY harem_price_stat DESC LIMIT 10').all();
    res.json({ kisses, gestures, price, harem });
});
app.get('/api/admin/view-favorites', (req, res) => {
    const rows = db.prepare('SELECT * FROM music_favorites ORDER BY created_at DESC LIMIT 20').all();
    res.json(rows);
});
app.get('/api/admin/clear-music-cache', (req, res) => {
    const result = db.prepare("DELETE FROM app_settings WHERE key LIKE 'ytsearch_%' OR key LIKE 'cilizmusicsearch_%' OR key LIKE 'cilizmusicpopular_%' OR key LIKE 'vimeosearch_%'").run();
    res.send('Temizlendi: ' + result.changes + ' mahni axtarisi keshi silindi');
});
app.get('/api/thumbnail/:videoId', async (req, res) => {
    try {
        const sizes = ['hqdefault.jpg', 'mqdefault.jpg', 'default.jpg'];
        let buffer = null;
        for (const size of sizes) {
          try {
            const imgUrl = 'https://i.ytimg.com/vi/' + req.params.videoId + '/' + size;
            const imgRes = await fetch(imgUrl);
            if (imgRes.ok) {
              const ab = await imgRes.arrayBuffer();
              if (ab.byteLength > 1000) { buffer = ab; break; }
            }
          } catch (e) {}
        }
        if (!buffer) { res.status(404).send(); return; }
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(Buffer.from(buffer));
    } catch (error) {
        res.status(404).send();
    }
});
app.get('/api/youtube/search', async (req, res) => {
    try {
        const q = req.query.q || '';
        const count = req.query.count || 20;
        const cacheKey = 'ytsearch_' + q.toLowerCase().trim() + '_' + count;
        const cachedSearch = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(cacheKey);
        if (cachedSearch) {
            console.log('WS: youtube axtaris keshden - ' + q);
            return res.json(JSON.parse(cachedSearch.value));
        }
        let finalResults = [];
        try {
          console.log('YTSR-DEBUG: axtaris bawladi - ' + q);
          const searchResult = await ytsr(q, { limit: Number(count) + 10 });
          console.log('YTSR-DEBUG: total_items=' + searchResult.items.length);
          if (searchResult.items[0]) {
            console.log('YTSR-DEBUG: first_item=' + JSON.stringify(searchResult.items[0]).substring(0, 500));
          }
          const videos = searchResult.items.filter(item => item.type === 'video');
          finalResults = videos.slice(0, count).map(item => {
            const idMatch = item.url.match(/[?&]v=([^&]+)/);
            const videoId = idMatch ? idMatch[1] : item.id;
            const durParts = (item.duration || '0:00').split(':').map(Number);
            let durSec = 0;
            if (durParts.length === 3) durSec = durParts[0] * 3600 + durParts[1] * 60 + durParts[2];
            else if (durParts.length === 2) durSec = durParts[0] * 60 + durParts[1];
            return {
              id: videoId,
              title: item.name,
              icon: req.protocol + '://' + req.get('host') + '/api/thumbnail/' + videoId,
              duration: durSec
            };
          });
        } catch (ytErr) {
          console.log('WS: ytsr axtaris xetasi - ' + ytErr.message);
        }
        if (!finalResults || finalResults.length === 0) {
          try {
            const yt = await getInnertube();
            const itSearch = await yt.search(q, { type: 'video' });
            const itVideos = (itSearch.videos || []).slice(0, count);
            finalResults = itVideos.map(v => ({
              id: v.id,
              title: v.title ? v.title.text : '',
              icon: req.protocol + '://' + req.get('host') + '/api/thumbnail/' + v.id,
              duration: v.duration ? v.duration.seconds : 0
            }));
            console.log('WS: youtubei.js elave etdi, say=' + youtubeResults.length);
          } catch (itErr) {
            console.log('WS: youtubei.js xetasi - ' + itErr.message);
          }
        }
        if (!finalResults || finalResults.length === 0) {
          const vimeoRes2 = await searchVimeo(q, count);
          finalResults = vimeoRes2.map(item => ({ id: item.id, title: item.title, icon: '', duration: item.duration }));
        }
        if (!finalResults || finalResults.length === 0) {
          const apiKeyFb2 = process.env.YOUTUBE_API_KEY;
          if (apiKeyFb2) {
            try {
              const urlFb2 = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${count}&q=${encodeURIComponent(q)}&key=${apiKeyFb2}`;
              const ytResFb2 = await fetch(urlFb2);
              const dataFb2 = await ytResFb2.json();
              if (dataFb2.items && dataFb2.items.length > 0) {
                const videoIdsFb2 = dataFb2.items.map(item => item.id.videoId).join(',');
                const detailsUrlFb2 = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIdsFb2}&key=${apiKeyFb2}`;
                const detailsResFb2 = await fetch(detailsUrlFb2);
                const detailsDataFb2 = await detailsResFb2.json();
                finalResults = (detailsDataFb2.items || []).map(item => ({
                  id: item.id,
                  title: item.snippet.title,
                  icon: req.protocol + '://' + req.get('host') + '/api/thumbnail/' + item.id,
                  duration: parseYoutubeDuration(item.contentDetails.duration)
                }));
                console.log('WS: youtube-api fallback (klip) ile tapildi - ' + q + ' - ' + finalResults.length + ' dene');
              }
            } catch (fbErr2) {
              console.log('WS: youtube-api fallback (klip) xetasi - ' + fbErr2.message);
            }
          }
        }
        if (finalResults && finalResults.length > 0) { db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(cacheKey, JSON.stringify(finalResults)); }
        res.json(finalResults);
    } catch (error) {
        console.error('youtube search error:', error);
        res.json([]);
    }
});;app.get('/api/youtube/vimeo/search', async (req, res) => {
    try {
        const q = req.query.q || '';
        const count = req.query.count || 20;
        const cacheKey = 'vimeosearch_' + q.toLowerCase().trim() + '_' + count;
        const cachedSearch = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(cacheKey);
        if (cachedSearch) {
            console.log('WS: vimeo-klip axtarisi keshden - ' + q);
            return res.json(JSON.parse(cachedSearch.value));
        }
        const results = await searchVimeo(q, count);
        const formatted = results.map(item => ({
            id: item.id,
            title: item.title,
            icon: '',
            duration: item.duration
        }));
        db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(cacheKey, JSON.stringify(formatted));
        res.json(formatted);
    } catch (error) {
        console.error('vimeo klip search error:', error);
        res.json([]);
    }
});app.get('/api/ciliz-music/get_by_ids_and_popular', async (req, res) => {
    try {
        const idsParam = String(req.query.ids || '').trim();
        if (idsParam) {
          const idsList = idsParam.split(',').map(s => s.trim()).filter(Boolean).slice(0, 50);
          const idResults = await Promise.all(idsList.map(async (vid) => {
            try {
              const oembedUrl = 'https://www.youtube.com/oembed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + vid) + '&format=json';
              const oRes = await fetch(oembedUrl);
              if (!oRes.ok) return null;
              const oData = await oRes.json();
              return { artist: oData.author_name || '', duration: 0, id: vid, title: oData.title || '', url: 'https://www.youtube.com/watch?v=' + vid, provider: 'cz' };
            } catch (oembedErr) { return null; }
          }));
          return res.json(idResults.filter(Boolean));
        }
        const count = req.query.count || 20;
        const cacheKey = 'cilizmusicpopular_' + count;
        const cachedPop = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(cacheKey);
        if (cachedPop) {
            console.log('WS: ciliz-music populyar keshden');
            return res.json(JSON.parse(cachedPop.value));
        }
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) return res.json([]);
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=${count}&regionCode=AZ&key=${apiKey}`;
        const ytRes = await fetch(url);
        const data = await ytRes.json();
        const results = (data.items || []).map(item => ({
            artist: item.snippet.channelTitle || '',
            duration: parseYoutubeDuration(item.contentDetails.duration),
            id: item.id,
            title: item.snippet.title,
            url: 'https://www.youtube.com/watch?v=' + item.id,
            provider: 'cz'
        }));
        let finalResults = results;
        if (!finalResults || finalResults.length === 0) {
          try {
            const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
            if (vimeoToken) {
              const vimeoUrl = 'https://api.vimeo.com/videos?query=' + encodeURIComponent('azerbaijan music') + '&per_page=' + count;
              const vimeoRes = await fetch(vimeoUrl, { headers: { Authorization: 'bearer ' + vimeoToken, Accept: 'application/vnd.vimeo.*+json;version=3.4' } });
              const vimeoData = await vimeoRes.json();
              if (vimeoData.data) {
                finalResults = vimeoData.data.map(item => ({
                  artist: (item.user && item.user.name) || '',
                  duration: item.duration || 180,
                  id: item.uri.split('/').pop(),
                  title: item.name,
                  url: item.link,
                  provider: 'vimeo'
                }));
                console.log('WS: vimeo-dan populyar tapildi - ' + finalResults.length + ' dene');
              }
            }
          } catch (vimeoErr) {
            console.log('WS: vimeo axtaris xetasi - ' + vimeoErr.message);
          }
        }
        db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(cacheKey, JSON.stringify(finalResults));
        res.json(finalResults);
    } catch (error) {
        console.error('ciliz-music popular error:', error);
        res.json([]);
    }
});
app.get('/api/youtube/popular', async (req, res) => {
    try {
        const count = req.query.count || 20;
        const cacheKey = 'ytpopular_' + count;
        const cachedPop2 = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(cacheKey);
        if (cachedPop2) {
            console.log('WS: youtube populyar keshden');
            return res.json(JSON.parse(cachedPop2.value));
        }
        let results = [];
        try {
          const searchResult = await ytsr('azerbaijan music 2026', { limit: Number(count) + 10 });
          const videos = searchResult.items.filter(item => item.type === 'video');
          results = videos.slice(0, count).map(item => {
            const idMatch = item.url.match(/[?&]v=([^&]+)/);
            const videoId = idMatch ? idMatch[1] : item.id;
            const durParts = (item.duration || '0:00').split(':').map(Number);
            let durSec = 0;
            if (durParts.length === 3) durSec = durParts[0] * 3600 + durParts[1] * 60 + durParts[2];
            else if (durParts.length === 2) durSec = durParts[0] * 60 + durParts[1];
            return {
              id: videoId,
              title: item.name,
              icon: req.protocol + '://' + req.get('host') + '/api/thumbnail/' + videoId,
              duration: durSec
            };
          });
        } catch (ytErr) {
          console.log('WS: ytsr populyar xetasi - ' + ytErr.message);
        }
        db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(cacheKey, JSON.stringify(results));
        res.json(results);
    } catch (error) {
        console.error('youtube popular error:', error);
        res.json([]);
    }
});app.get('/api/youtube/get_by_ids', async (req, res) => {
    try {
        const ids = req.query.id || '';
        if (!ids) return res.json([]);
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) return res.json([]);
        const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${ids}&key=${apiKey}`;
        const ytRes = await fetch(url);
        const data = await ytRes.json();
        const results = (data.items || []).map(item => ({
            id: item.id,
            title: item.snippet.title,
            icon: item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : '',
            duration: parseYoutubeDuration(item.contentDetails.duration)
        }));
        res.json(results);
    } catch (error) {
        console.error('youtube get_by_ids error:', error);
        res.json([]);
    }
});

function parseYoutubeDuration(iso) {
    const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
}
app.get('/api/admin/reset-daily-bonus/:userId', (req, res) => {
    const result = db.prepare('DELETE FROM app_settings WHERE key = ?').run('daily_bonus_claim_' + req.params.userId);
    res.send('Silindi: ' + result.changes);
});
app.get('/api/admin/reset-all-registration', authLib.requireAdmin, (req, res) => {
    const result = db.prepare('UPDATE users SET game_registered = 0').run();
    res.send('Tamamlandi: ' + result.changes + ' istifadeci sifirlandi');
});
let GIFT_PRICES = {};
try {
  let giftPricesRaw2 = require('fs').readFileSync(require('path').join(__dirname, 'gift-prices.json'), 'utf8');
  if (giftPricesRaw2.charCodeAt(0) === 0xFEFF) giftPricesRaw2 = giftPricesRaw2.slice(1);
  GIFT_PRICES = JSON.parse(giftPricesRaw2);
  console.log('WS: gift-prices.json yuklendi - ' + Object.keys(GIFT_PRICES).length + ' hediyye');
} catch (e) { console.log('WS: gift-prices.json tapilmadi - ' + e.message); }
let ACHIEVEMENTS = {};
try {
  let assetsRaw = require('fs').readFileSync(require('path').join(__dirname, 'game-assets', 'assets.json'), 'utf8');
  if (assetsRaw.charCodeAt(0) === 0xFEFF) assetsRaw = assetsRaw.slice(1);
  const assetsData = JSON.parse(assetsRaw);
  ACHIEVEMENTS = assetsData.achievement || {};
  console.log('WS: achievements yuklendi - ' + Object.keys(ACHIEVEMENTS).length + ' dene');
} catch (e) { console.log('WS: assets.json (achievements) tapilmadi - ' + e.message); }
const BANNED_WORDS = ['sik','sikim','sikeyim','siktir','sikdir','yarrag','yarraq','yarrağ','amcik','amciq','amcık','orospu','orospucocugu','qehbe','qehbeler','qahbe','pic','pici','got','goted','gotveren','gotverin','ana sikim','anani','ananiseks','bacini','bacinisik','kopoglu','qancig','qanciq','fahişe','fahishe','malaka','suka','blyad','pidor','xuy','ebun','pizda','mudak','gandon','siktim','siktimin','yavshaq','yavşaq','deyyus','dəyyus','ipne','ibne','pezevenk','sittirolim','amina','amina qoyim','amina qoyum','anani sikim','bok','boq','gotu','gotoglan'];
function normalizeForFilter(text) {
  return (text || '').toLowerCase()
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/@/g, 'a').replace(/\$/g, 's')
    .replace(/[^a-zəöüğıçş\s]/gi, '');
}
function containsBannedWord(text) {
  if (!text) return false;
  const normalized = normalizeForFilter(text);
  const compact = normalized.replace(/\s+/g, '');
  return BANNED_WORDS.some(w => { const wc = w.replace(/\s+/g, ''); return normalized.includes(w) || compact.includes(wc); });
}
function containsPhoneNumber(text) {
  if (!text) return false;
  const cleaned = (text || '').replace(/[\s\-\.\(\)]/g, '');
  return /\d{7,}/.test(cleaned);
}
const userIdToWs = new Map();
const lastRoomByUserId = new Map();
const server = http.createServer(app);

// ===== Ozel WebSocket server (JSONSocket protokolu ucun) =====
const wss = new WebSocket.Server({ server, path: '/ws/' });
const wsPingInterval = setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.isAlive === false) {
      console.log('WS: ping cavabsiz, baglanti bagladi');
      return client.terminate();
    }
    client.isAlive = false;
    client.ping();
  });
  liveStreamsMap.forEach((s, streamId) => {
    const host = s.seats.get(s.hostId);
    const hostAlive = Boolean(host && host.ws && host.ws.readyState === 1);
    if (!hostAlive) {
      console.log('WS: olu canli yayim temizlendi - id=' + streamId);
      liveBroadcast(s, { type: 'live_ended', stream_id: streamId });
      liveStreamsMap.delete(streamId);
    }
  });
}, 25000);
function addKissLeagueScore(userId, amount) {
  const today = new Date().toISOString().slice(0, 10);
  const row = db.prepare('SELECT daily_kiss_league_points, daily_kiss_league_limit, daily_kiss_limit_date FROM users WHERE id = ?').get(userId);
  if (!row) return 0;
  let currentPoints = row.daily_kiss_league_points || 0;
  let currentLimit = row.daily_kiss_league_limit || 20;
  if (row.daily_kiss_limit_date !== today) {
    currentPoints = 0;
    currentLimit = 20;
    db.prepare('UPDATE users SET daily_kiss_league_points = 0, daily_kiss_league_limit = 20, daily_kiss_limit_date = ? WHERE id = ?').run(today, userId);
  }
  const remaining = Math.max(0, currentLimit - currentPoints);
  const actualAdd = Math.min(amount, remaining);
  if (actualAdd > 0) {
    db.prepare('UPDATE users SET daily_kiss_league_points = daily_kiss_league_points + ? WHERE id = ?').run(actualAdd, userId);
    addDailyLeagueScore(userId, actualAdd);
  }
  return actualAdd;
}
function getActiveStatus(user) {
  if (!user || !user.user_status) return '';
  if (!user.user_status_set_at) return user.user_status;
  const setAt = new Date(user.user_status_set_at);
  const hoursSince = (Date.now() - setAt.getTime()) / (1000 * 60 * 60);
  return hoursSince < 24 ? user.user_status : '';
}
function isKickedFromRoom(userId, gameId) {
  const row = db.prepare('SELECT kicked_until, kicked_from_game_id FROM users WHERE id = ?').get(userId);
  if (!row || !row.kicked_until) return false;
  if (Number(row.kicked_from_game_id) !== Number(gameId)) return false;
  return new Date(row.kicked_until) > new Date();
}
function addDailyLeagueScore(userId, amount) {
  const today = new Date().toISOString().slice(0, 10);
  const row = db.prepare('SELECT daily_league_score, daily_league_date, league_tier FROM users WHERE id = ?').get(userId);
  if (!row) return;
  if (row.daily_league_date !== today) {
    db.prepare('UPDATE users SET daily_league_score = ?, daily_league_date = ? WHERE id = ?').run(amount, today, userId);
  } else {
    db.prepare('UPDATE users SET daily_league_score = daily_league_score + ? WHERE id = ?').run(amount, userId);
  }
  const targetWs = userIdToWs.get(userId);
  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    const todayLeague2 = new Date().toISOString().slice(0, 10);
    const scoreRow2 = db.prepare('SELECT daily_league_score, daily_league_date, league_tier FROM users WHERE id = ?').get(userId);
    const myScore2 = (scoreRow2 && scoreRow2.daily_league_date === todayLeague2) ? scoreRow2.daily_league_score : 0;
    const myTierName2 = (scoreRow2 && scoreRow2.league_tier) ? scoreRow2.league_tier : 'bronze';
    const tierOrderList2 = ['wood', 'rock', 'iron', 'steel', 'bronze', 'marble', 'silver', 'gold', 'platinum', 'amber', 'amethyst', 'topaz', 'pearls', 'sapphire', 'ruby', 'emerald', 'diamond'];
    const myLeague2 = tierOrderList2.indexOf(myTierName2);
    let leagueUsers2 = db.prepare('SELECT id, username, display_name, daily_league_score, avatar_data FROM users WHERE league_tier = ? AND daily_league_date = ? ORDER BY daily_league_score DESC LIMIT 10').all(myTierName2, todayLeague2);
    if (!leagueUsers2.some(u => u.id === userId)) {
      const selfRow = db.prepare('SELECT id, username, display_name, daily_league_score, avatar_data FROM users WHERE id = ?').get(userId);
      if (selfRow) leagueUsers2.push(selfRow);
    }
    targetWs.send(encodeMessage({
      packet: targetWs.packetCounter = (targetWs.packetCounter||1000)+1,
      type: 'league_start',
      league_state: myScore2 >= 1 ? 'running' : 'idle',
      league: myLeague2,
      max_league: tierOrderList2.length,
      start_ms: Date.now() - 86400000,
      finish_ms: Date.now() + 6 * 86400000,
      move_up: 3,
      move_down: 3,
      gifts: [], items: { kiss_fire: [3,2,1,0,0,0,0], refuse_slap: [2,1,1,0,0,0,0], league_kiss2x: [1,1,0,0,0,0,0], league_kiss_lim10: [1,0,0,0,0,0,0], league5: [1,1,1,0,0,0,0] },
      gold: leagueUsers2.map((u, i) => i === 0 ? 300 : (i === 1 ? 200 : (i === 2 ? 100 : 0))),
      tokens: leagueUsers2.map(u => 0),
      users: leagueUsers2.map((u, i) => ({
        id: String(u.id),
        name: u.display_name || u.username,
        score: u.daily_league_score,
        rank: i + 1,
        photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : ''
      }))
    }));
  }
}async function searchVimeo(query, count) {
  try {
    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
    if (!vimeoToken) return [];
    const vimeoUrl = 'https://api.vimeo.com/videos?query=' + encodeURIComponent(query) + '&per_page=' + count;
    const vimeoRes = await fetch(vimeoUrl, { headers: { Authorization: 'bearer ' + vimeoToken, Accept: 'application/vnd.vimeo.*+json;version=3.4' } });
    const vimeoData = await vimeoRes.json();
    if (!vimeoData.data) return [];
    const mapped = vimeoData.data.map(item => ({
      artist: (item.user && item.user.name) || '',
      duration: item.duration || 180,
      id: item.uri.split('/').pop(),
      title: item.name,
      url: item.link,
      provider: 'vimeo'
    }));
    console.log('WS: vimeo-dan mahni tapildi - ' + query + ' - ' + mapped.length + ' dene');
    return mapped;
  } catch (vimeoErr) {
    console.log('WS: vimeo axtaris xetasi - ' + vimeoErr.message);
    return [];
  }
}function encodeMessage(obj) {
  const json = JSON.stringify(obj);
  const utf8 = Buffer.from(json, 'utf8');
  const header = Buffer.from([Math.floor(utf8.length / 256), utf8.length % 256]);
  return Buffer.concat([header, utf8]);
}

function decodeMessage(buffer) {
  const len = buffer[0] * 256 + buffer[1];
  const jsonBuf = buffer.slice(2, 2 + len);
  return JSON.parse(jsonBuf.toString('utf8'));
}

function parseCookies(header) {
  const result = {};
  if (!header) return result;
  header.split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.substring(0, idx).trim();
      const val = part.substring(idx + 1).trim();
      result[key] = decodeURIComponent(val);
    }
  });
  return result;
}

// Coxsayli otaqlar - her otaqda maksimum MAX_SEATS oyunu
const MAX_SEATS = 12;
let nextGameId = 1;
const liveStreamsMap = new Map();
let nextStreamId = 1;
const LIVE_ROOM_CATALOG = [
  { id: '1', name: 'Otaq 1', isVideoCallRoom: false },
  { id: '2', name: 'Otaq 2', isVideoCallRoom: false },
  { id: '3', name: 'Otaq 3', isVideoCallRoom: false },
  { id: '4', name: 'Otaq 4', isVideoCallRoom: false },
  { id: '5', name: 'Otaq 5', isVideoCallRoom: false },
  { id: '6', name: 'Görüntülü otaq', isVideoCallRoom: true }
];
const videoRooms = require('./video_room_server')(app, { authLib, db, findRoom: id => LIVE_ROOM_CATALOG.find(room => room.id === id) });

function normalizeLiveRoomId(value) {
  const id = String(value == null ? '' : value).trim();
  return LIVE_ROOM_CATALOG.some(room => room.id === id) ? id : '';
}
function getLiveRoomStream(roomId) {
  if (!roomId) return null;
  for (const stream of liveStreamsMap.values()) {
    if (stream.roomId === roomId) return stream;
  }
  return null;
}

// Gecə otaqlarının seçilmiş YouTube klipləri. Otaq səhifəsi və canlı ekranı ayrı qalır;
// klip otağın öz dizaynında göstərilir və app_settings-də saxlanır.
const roomYoutubeMap = new Map();
function roomYoutubeKey(roomId) { return 'live_room_youtube_' + roomId; }
function normalizeYoutubeVideoId(value) {
  let raw = String(value == null ? '' : value).trim();
  const match = raw.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,20})/i);
  if (match) raw = match[1];
  return /^[A-Za-z0-9_-]{6,20}$/.test(raw) ? raw : '';
}
function youtubeClipMeta(title, singer, song) {
  const full = String(title || '').trim().slice(0, 200);
  const explicitSinger = String(singer || '').trim().slice(0, 100);
  const explicitSong = String(song || '').trim().slice(0, 160);
  if (explicitSinger || explicitSong) return { singer: explicitSinger || 'Müğənni', song: explicitSong || full || 'YouTube klipi' };
  const parts = full.split(/\s+[–—-]\s+/).map(x => x.trim()).filter(Boolean);
  if (parts.length >= 2) return { singer: parts.shift().slice(0, 100), song: parts.join(' - ').slice(0, 160) };
  return { singer: 'Müğənni', song: full || 'YouTube klipi' };
}
function getRoomYoutubeClip(roomId) {
  if (!roomId) return null;
  if (roomYoutubeMap.has(roomId)) return roomYoutubeMap.get(roomId);
  try {
    const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(roomYoutubeKey(roomId));
    if (row && row.value) {
      const clip = JSON.parse(row.value);
      if (clip && normalizeYoutubeVideoId(clip.videoId)) {
        const meta = youtubeClipMeta(clip.title, clip.singer, clip.song);
        const clean = { videoId: normalizeYoutubeVideoId(clip.videoId), title: String(clip.title || '').slice(0, 200), singer: meta.singer, song: meta.song, addedBy: String(clip.addedBy || '').slice(0, 100), addedById: String(clip.addedById || '').slice(0, 64), thumbnail: String(clip.thumbnail || '').slice(0, 500), updatedAt: Number(clip.updatedAt) || Date.now(), startedAt: Number(clip.startedAt) || Number(clip.updatedAt) || Date.now() };
        roomYoutubeMap.set(roomId, clean);
        return clean;
      }
    }
  } catch (e) { console.error('room youtube read error:', e.message); }
  return null;
}
function saveRoomYoutubeClip(roomId, clip) {
  const now = Date.now();
  const meta = youtubeClipMeta(clip.title, clip.singer, clip.song);
  const clean = { videoId: normalizeYoutubeVideoId(clip.videoId), title: String(clip.title || '').trim().slice(0, 200), singer: meta.singer, song: meta.song, addedBy: String(clip.addedBy || '').trim().slice(0, 100), addedById: String(clip.addedById || '').trim().slice(0, 64), thumbnail: String(clip.thumbnail || '').trim().slice(0, 500), updatedAt: now, startedAt: now };
  if (!clean.videoId) throw new Error('invalid_video_id');
  roomYoutubeMap.set(roomId, clean);
  db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(roomYoutubeKey(roomId), JSON.stringify(clean));
  return clean;
}
function clearRoomYoutubeClip(roomId) {
  roomYoutubeMap.delete(roomId);
  db.prepare('DELETE FROM app_settings WHERE key = ?').run(roomYoutubeKey(roomId));
}

// Gecə otağı: 12 mikrofon yeri, WebRTC səs mesh-i, çat və otaq hədiyyələri.
const NIGHT_ROOM_MAX_SEATS = 12;
const nightRoomMembers = new Map(); // roomId -> Map<WebSocket, member>
const nightRoomChats = new Map(); // roomId -> recent messages
const nightRoomGiftSupporters = new Map(); // roomId -> Map<userId, supporter>
function getNightRoomMembers(roomId) { return nightRoomMembers.get(roomId) || new Map(); }
function getNightRoomMemberCount(roomId) { return getNightRoomMembers(roomId).size; }
function nightRoomMemberPayload(member) {
  const level = Math.max(1, Math.min(50, Number(member.level) || 1));
  return { user_id: String(member.userId), name: member.name, photo: member.photo || '', muted: Boolean(member.muted), level, badge: member.badge || liveLevelBadge(level) };
}
function nightRoomBroadcast(roomId, payload, exceptWs) {
  const members = nightRoomMembers.get(roomId);
  if (!members) return;
  members.forEach(member => { if (member.ws !== exceptWs) liveSend(member.ws, payload); });
}
function nightRoomFindMember(roomId, userId) {
  const members = nightRoomMembers.get(roomId);
  if (!members) return null;
  const wanted = String(userId);
  for (const member of members.values()) if (String(member.userId) === wanted) return member;
  return null;
}
function leaveNightRoom(ws, reason) {
  const roomId = ws && ws.nightRoomId;
  if (!roomId) return;
  const members = nightRoomMembers.get(roomId);
  const member = members && members.get(ws);
  if (members && member) {
    members.delete(ws);
    nightRoomBroadcast(roomId, { type: 'night_room_member_left', user_id: String(member.userId), reason: reason || 'left' });
    if (!members.size) nightRoomMembers.delete(roomId);
  }
  ws.nightRoomId = null;
  ws.nightRoomMemberId = null;
}
function grantNightRoomGiftMedia(roomId, effectId) {
  if (!effectId) return;
  const members = nightRoomMembers.get(roomId);
  if (!members) return;
  const expires = Date.now() + 25000;
  members.forEach(member => giftMediaEntitlements.set(giftMediaKey(member.userId, effectId), expires));
}
const pkInvites = new Map();
const pkSessions = new Map();
const PK_INVITE_MS = 30000;
const PK_COUNTDOWN_MS = 3000;
// Railway-da PK_BATTLE_SECONDS ile deyisdirile biler. Standart 5 deqiqedir.
const PK_BATTLE_MS = Math.max(60000, (Number(process.env.PK_BATTLE_SECONDS) || 300) * 1000);
const PK_RESULT_MS = 30000;
const LIVE_GLOBAL_GIFT_MIN = Math.max(1, Number(process.env.LIVE_GLOBAL_GIFT_MIN || 1000));

// Yayımçı liderliyi: dövrlər Bakı vaxtı ilə hesablanır və canlı bitəndən sonra da qalır.
db.exec(`CREATE TABLE IF NOT EXISTS live_broadcaster_gifts (
  user_id INTEGER NOT NULL,
  period TEXT NOT NULL,
  period_key TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, period, period_key)
)`);
function bakuPeriodKey(period, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Baku', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(date).reduce((o,p)=>(o[p.type]=p.value,o),{});
  const day = `${parts.year}-${parts.month}-${parts.day}`;
  if (period === 'daily') return day;
  const d = new Date(`${day}T12:00:00Z`);
  const weekday = d.getUTCDay() || 7;
  if (period === 'weekly') { d.setUTCDate(d.getUTCDate() - weekday + 1); return d.toISOString().slice(0,10); }
  return `${parts.year}-${parts.month}`;
}
function broadcasterLeaderboard(period) {
  const key = bakuPeriodKey(period);
  return db.prepare(`SELECT u.id user_id, COALESCE(u.display_name,u.username) name,
      CASE WHEN u.avatar_data IS NOT NULL AND u.avatar_data <> '' THEN '/api/avatar/'||u.id ELSE '' END photo,
      g.points FROM live_broadcaster_gifts g JOIN users u ON u.id=g.user_id
      WHERE g.period=? AND g.period_key=? ORDER BY g.points DESC, g.updated_at ASC LIMIT 50`).all(period, key);
}
function recordBroadcasterGift(userId, points) {
  for (const period of ['daily','weekly','monthly']) {
    const key = bakuPeriodKey(period);
    db.prepare(`INSERT INTO live_broadcaster_gifts(user_id,period,period_key,points)
      VALUES(?,?,?,?) ON CONFLICT(user_id,period,period_key)
      DO UPDATE SET points=points+excluded.points, updated_at=datetime('now')`).run(userId, period, key, points);
  }
}

function liveGiftLevel(score) {
  const points=Math.max(0,Number(score)||0); let level=1;
  while(level<50 && points>=Math.round(100*Math.pow(level,2.65))) level++;
  return level;
}
function liveLevelBadge(level) {
  const icons=['◇','◆','✦','★','✪','✹','♛','💎','👑','🔱'];
  return icons[Math.min(9,Math.floor((Math.max(1,level)-1)/5))];
}

function liveSend(client, payload) {
  if (!client || client.readyState !== WebSocket.OPEN) return;
  client.send(encodeMessage(Object.assign({}, payload, {
    packet: client.packetCounter = (client.packetCounter || 1000) + 1
  })));
}

function liveBroadcast(stream, payload) {
  if (!stream) return;
  const sent = new Set();
  stream.seats.forEach(seat => { if (!sent.has(seat.ws)) { sent.add(seat.ws); liveSend(seat.ws, payload); } });
  stream.viewers.forEach((uid, client) => { if (!sent.has(client)) { sent.add(client); liveSend(client, payload); } });
}

function pkBroadcast(session, payload) {
  const a = liveStreamsMap.get(session.streamA);
  const b = liveStreamsMap.get(session.streamB);
  liveBroadcast(a, Object.assign({ pk_id: session.id, server_now: Date.now() }, payload));
  liveBroadcast(b, Object.assign({ pk_id: session.id, server_now: Date.now() }, payload));
}

function pkSnapshot(stream) {
  const session = stream.pk && pkSessions.get(stream.pk.id);
  if (!session || session.phase === 'finished') return null;
  const other = liveStreamsMap.get(stream.pk.otherStreamId);
  const host = other && other.seats.get(other.hostId);
  return {type:'pk_started', pk_id:session.id, side:stream.pk.side, phase:session.phase,
    server_now:Date.now(), starts_at:session.startsAt, ends_at:session.endsAt,
    result_ends_at:session.resultEndsAt, score_a:session.scoreA, score_b:session.scoreB,
    winner:session.scoreA === session.scoreB ? 'draw' : session.scoreA > session.scoreB ? 'A' : 'B',
    opponent_stream_id:stream.pk.otherStreamId, opponent_host_id:String(host ? host.userId : (stream.pk.side === 'A' ? session.hostB : session.hostA)),
    opponent_host_name:host ? host.name : 'Yayımçı', opponent_host_photo:host ? host.photo : '', opponent_photo_url:host ? (host.livePhotoUrl || host.photoData || '') : ''};
}

function clearPkTimers(session) {
  if (!session) return;
  clearTimeout(session.countdownTimer);
  clearTimeout(session.battleTimer);
  clearTimeout(session.resultTimer);
}

function finishPk(session, reason) {
  if (!session || session.phase === 'finished' || session.phase === 'result') return;
  clearPkTimers(session);
  session.phase = 'result';
  session.resultEndsAt = Date.now() + PK_RESULT_MS;
  const winner = session.scoreA === session.scoreB ? 'draw' : (session.scoreA > session.scoreB ? 'A' : 'B');
  pkBroadcast(session, { type: 'pk_ended', phase: 'result', reason: reason || 'time', winner,
    score_a: session.scoreA, score_b: session.scoreB, result_ends_at: session.resultEndsAt });
  session.resultTimer = setTimeout(() => {
    session.phase = 'finished';
    const a = liveStreamsMap.get(session.streamA);
    const b = liveStreamsMap.get(session.streamB);
    if (a && a.pk && a.pk.id === session.id) a.pk = null;
    if (b && b.pk && b.pk.id === session.id) b.pk = null;
    pkBroadcast(session, { type: 'pk_closed', reason: reason || 'time' });
    pkSessions.delete(session.id);
  }, PK_RESULT_MS);
}

function cancelPkForStream(streamId, reason) {
  const stream = liveStreamsMap.get(Number(streamId));
  if (!stream || !stream.pk) return;
  const session = pkSessions.get(stream.pk.id);
  if (session) finishPk(session, reason || 'host_left');
}
const rooms = new Map();
const liveStreams = new Map(); // gameId -> { gameId, players: Map(ws -> player) }

function createRoom() {
  const room = { gameId: nextGameId++, players: new Map(), stickedGifts: new Map() };
  rooms.set(room.gameId, room);
  return room;
}

function findRoomWithSpace() {
  for (const room of rooms.values()) {
    if (room.players.size < MAX_SEATS) return room;
  }
  return createRoom();
}

function broadcastToRoom(room, excludeWs, msg) {
  console.log('BROADCAST-DEBUG: type=' + msg.type + ' room=' + room.gameId + ' total_players=' + room.players.size);
  room.players.forEach((player, clientWs) => {
    if (clientWs !== excludeWs && clientWs.readyState === WebSocket.OPEN) {
      if (!clientWs.packetCounter) clientWs.packetCounter = 1000;
      msg.packet = clientWs.packetCounter++;
      clientWs.send(encodeMessage(msg));
    }
  });
}

function getNextSeatInRoom(room) {
  const usedSeats = new Set();
  room.players.forEach(p => usedSeats.add(p.seat));
  const availableSeats = [];
  for (let s = 0; s < MAX_SEATS; s++) {
    if (!usedSeats.has(s)) availableSeats.push(s);
  }
  if (availableSeats.length === 0) {
    let seat = 0;
    while (usedSeats.has(seat)) seat++;
    return seat;
  }
  return availableSeats[Math.floor(Math.random() * availableSeats.length)];
}function removePlayerFromRoom(room, ws) {
  if (!room || !room.players.has(ws)) return;
  const leftPlayer = room.players.get(ws);
  room.players.delete(ws);
  if (leftPlayer && leftPlayer.id && room.stickedGifts) room.stickedGifts.delete(leftPlayer.id);
  broadcastToRoom(room, ws, { type: 'game_leave', user: leftPlayer });
  if (room.pendingSpin) {
    const wasInvolved = room.pendingSpin.players.some(x => x.p.id === leftPlayer.id);
    if (wasInvolved) {
      if (room.bottleTimer) { clearTimeout(room.bottleTimer); room.bottleTimer = null; }
      room.pendingSpin = null;
      console.log('BOTTLE-DEBUG: masa=' + room.gameId + ' - firlanma legv edildi, oyuncu ayrildi=' + leftPlayer.id);
      setTimeout(() => startBottleTurn(room), 500);
    }
  }
}
function startBottleTurn(room) {
  if (room.bottleTimer) return;
  const players = [];
  room.players.forEach((p, ws) => players.push({ p, ws }));
  if (players.length < 2) return;
  const hasMale = players.some(x => x.p.male);
  const hasFemale = players.some(x => !x.p.male);
  console.log('BOTTLE-DEBUG: masa=' + room.gameId + ' oyuncular=' + JSON.stringify(players.map(x => ({id: x.p.id, name: x.p.name, male: x.p.male}))) + ' hasMale=' + hasMale + ' hasFemale=' + hasFemale);
  if (!hasMale || !hasFemale) { console.log('BOTTLE-DEBUG: masa=' + room.gameId + ' - DAYANDI, iki cins yoxdur'); return; }
  const sortedPlayers = players.slice().sort((a, b) => a.p.seat - b.p.seat);
  let nextIdx = 0;
  if (room.lastActiveSeat !== undefined) {
    const currentPos = sortedPlayers.findIndex(x => x.p.seat > room.lastActiveSeat);
    nextIdx = currentPos === -1 ? 0 : currentPos;
  }
  const active = sortedPlayers[nextIdx];
  const activeIdx = players.indexOf(active);
  room.lastActiveSeat = active.p.seat;
  room.lastActiveId = active.p.id;
  broadcastToRoom(room, null, { type: 'game_turn_offer', user: { id: active.p.id, name: active.p.name } });
  console.log('BOTTLE: turn_offer gonderildi - ' + new Date().toISOString());
  room.pendingSpin = { active, players, activeIdx };
  const finishSpin = () => {
    if (!room.pendingSpin) return;
    room.bottleTimer = null;
    room.pendingSpin = null;
    const others = players.filter((x, i) => i !== activeIdx && x.p.male !== active.p.male);
    if (others.length === 0) return;
    const passive = others[Math.floor(Math.random() * others.length)];
    broadcastToRoom(room, null, { type: 'game_turn', active: { id: active.p.id, name: active.p.name }, user: { id: passive.p.id, name: passive.p.name } });
    console.log('BOTTLE: game_turn gonderildi - ' + new Date().toISOString());
    room.bottleTimer = setTimeout(() => {
      room.bottleTimer = null;
      startBottleTurn(room);
    }, 10000);
  };
  room.finishSpin = finishSpin;
  room.bottleTimer = setTimeout(finishSpin, 5000);
}
wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  var allowedOrigins = ALLOWED_ORIGINS;
  var requestOrigin = String(req.headers.origin || '');
  var sameOrigin = false;
  try { sameOrigin = Boolean(requestOrigin) && new URL(requestOrigin).host === String(req.headers.host || ''); } catch (_) {}
  if (!sameOrigin && (!requestOrigin || allowedOrigins.indexOf(requestOrigin) < 0)) {
    console.log('WS: yad domenden qosulma redd edildi - ' + req.headers.origin);
    ws.close();
    return;
  }
  console.log('WS: yeni qo■ulma');

  let wsUser = null;
  const activityInterval = setInterval(() => {
    if (wsUser) {
      const todayAct = new Date().toISOString().slice(0, 10);
      const actRow = db.prepare('SELECT daily_active_seconds, daily_active_date FROM users WHERE id = ?').get(wsUser.id);
      if (!actRow) return;
      let newSeconds;
      if (actRow.daily_active_date !== todayAct) {
        newSeconds = 60;
        db.prepare('UPDATE users SET daily_active_seconds = 60, daily_active_date = ?, claimed_hour_milestones = ? WHERE id = ?').run(todayAct, '', wsUser.id);
      } else {
        newSeconds = actRow.daily_active_seconds + 60;
        db.prepare('UPDATE users SET daily_active_seconds = daily_active_seconds + 60 WHERE id = ?').run(wsUser.id);
      }
    }
  }, 60000);

  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.authToken;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      wsUser = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id || decoded.userId);
      console.log('WS: istifadeci tanindi -', wsUser ? wsUser.username : 'tapilmadi');
      if (wsUser && wsUser.is_banned) {
        console.log('WS: banli istifadeci qosulma cehdi - ' + wsUser.username);
        ws.send(encodeMessage({ type: 'error', error: 'banned', packet: 1 }));
        ws.close();
        return;
      }      if (wsUser) userIdToWs.set(wsUser.id, ws);
      if (wsUser) {
        const todayCheck = new Date().toISOString().slice(0, 10);
        if (wsUser.daily_league_date && wsUser.daily_league_date !== todayCheck) {
          const myTier = wsUser.league_tier || 'bronze';
          const sameTierUsers = db.prepare('SELECT id, daily_league_score FROM users WHERE league_tier = ? AND daily_league_date = ? ORDER BY daily_league_score DESC LIMIT 1').all(myTier, wsUser.daily_league_date);
          if (sameTierUsers.length > 0 && sameTierUsers[0].id === wsUser.id && sameTierUsers[0].daily_league_score > 0) {
            const tierOrder = ['wood', 'rock', 'iron', 'steel', 'bronze', 'marble', 'silver', 'gold', 'platinum', 'amber', 'amethyst', 'topaz', 'pearls', 'sapphire', 'ruby', 'emerald', 'diamond'];
            const currentIdx = tierOrder.indexOf(myTier);
            if (currentIdx >= 0 && currentIdx < tierOrder.length - 1) {
              const nextTier = tierOrder[currentIdx + 1];
              db.prepare('UPDATE users SET league_tier = ? WHERE id = ?').run(nextTier, wsUser.id);
              wsUser.league_tier = nextTier;
              console.log('WS: gunun qalibi yuksek liqaya kecdi - ' + wsUser.username + ' - ' + myTier + ' -> ' + nextTier);
              const leagueFrameMap = { marble: 'silver', silver: 'gold', gold: 'platinum', platinum: 'amber', amber: 'amethyst', amethyst: 'topaz', topaz: 'pearls', pearls: 'sapphire', sapphire: 'ruby', ruby: 'emerald', emerald: 'diamond' };
              if (leagueFrameMap[nextTier]) {
                const frameName = leagueFrameMap[nextTier];
                const ownedRowLg = db.prepare('SELECT owned_items FROM users WHERE id = ?').get(wsUser.id);
                let ownedItemsLg = {};
                if (ownedRowLg && ownedRowLg.owned_items) {
                  try { ownedItemsLg = JSON.parse(ownedRowLg.owned_items); } catch (e) {}
                }
                ownedItemsLg[frameName] = true;
                db.prepare('UPDATE users SET owned_items = ? WHERE id = ?').run(JSON.stringify(ownedItemsLg), wsUser.id);
                console.log('WS: liqa cercivesi verildi - ' + wsUser.username + ' - ' + frameName);
              }            }
          }
        }
      }
    }
  } catch (e) {
    console.log('WS: token yoxlama xetasi -', e.message);
  }


  ws.on('message', async (data) => {
    try {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const msg = decodeMessage(buffer);
      console.log('WS RECV:', JSON.stringify(msg));

      if (['start_pk', 'respond_pk', 'invite_to_live', 'respond_to_invite', 'request_live_seat'].includes(msg.type)) {
        liveSend(ws, { type: 'live_feature_unavailable', message: 'Yaxında işləyəcək' });
        return;
      }

      // Gecə otağının ayrıca səs/çat/hədiyyə protokolu. Bu axın /live-v2-dən ayrıdır.
      if (msg.type === 'night_room_join') {
        if (!wsUser) { liveSend(ws, { type: 'night_room_error', reason: 'not_logged_in' }); return; }
        const roomIdNight = normalizeLiveRoomId(msg.room_id);
        if (!roomIdNight) { liveSend(ws, { type: 'night_room_error', reason: 'room_not_found' }); return; }
        if (LIVE_ROOM_CATALOG.find(room => room.id === roomIdNight).isVideoCallRoom) { liveSend(ws, { type: 'night_room_error', reason: 'video_room_only' }); return; }
        if (ws.nightRoomId) leaveNightRoom(ws, 'switched');
        for (const [oldRoomId, oldMembers] of nightRoomMembers.entries()) {
          for (const [oldWs, oldMember] of oldMembers.entries()) {
            if (oldWs !== ws && String(oldMember.userId) === String(wsUser.id)) leaveNightRoom(oldWs, 'replaced');
          }
          if (!oldMembers.size) nightRoomMembers.delete(oldRoomId);
        }
        let members = nightRoomMembers.get(roomIdNight);
        if (!members) { members = new Map(); nightRoomMembers.set(roomIdNight, members); }
        if (members.size >= NIGHT_ROOM_MAX_SEATS) { liveSend(ws, { type: 'night_room_error', reason: 'seats_full', max_seats: NIGHT_ROOM_MAX_SEATS }); return; }
        const memberLevelRow = db.prepare('SELECT gift_level_score FROM users WHERE id = ?').get(wsUser.id);
        const memberLevel = liveGiftLevel(memberLevelRow && memberLevelRow.gift_level_score);
        const member = { ws, userId: wsUser.id, name: wsUser.display_name || wsUser.username, photo: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '', muted: false, level: memberLevel, badge: liveLevelBadge(memberLevel) };
        members.set(ws, member);
        ws.nightRoomId = roomIdNight;
        ws.nightRoomMemberId = String(wsUser.id);
        const memberList = Array.from(members.values()).map(nightRoomMemberPayload);
        liveSend(ws, { type: 'night_room_joined', room_id: roomIdNight, my_id: String(wsUser.id), max_seats: NIGHT_ROOM_MAX_SEATS, members: memberList, chat_history: (nightRoomChats.get(roomIdNight) || []).slice(-50), youtube: getRoomYoutubeClip(roomIdNight) });
        nightRoomBroadcast(roomIdNight, { type: 'night_room_member_joined', member: nightRoomMemberPayload(member) }, ws);
        return;
      }
      if (msg.type === 'night_room_leave') { leaveNightRoom(ws, 'left'); return; }
      if (msg.type === 'night_room_voice_offer' || msg.type === 'night_room_voice_answer' || msg.type === 'night_room_voice_ice') {
        if (!ws.nightRoomId || !nightRoomFindMember(ws.nightRoomId, ws.nightRoomMemberId)) return;
        const target = nightRoomFindMember(ws.nightRoomId, msg.target_id);
        if (!target || target.ws === ws) return;
        const relay = { type: msg.type, from_id: String(ws.nightRoomMemberId), sdp: msg.sdp, candidate: msg.candidate };
        liveSend(target.ws, relay);
        return;
      }
      if (msg.type === 'night_room_chat') {
        if (!wsUser || !ws.nightRoomId || !nightRoomFindMember(ws.nightRoomId, ws.nightRoomMemberId)) return;
        const text = String(msg.text || '').trim().slice(0, 240);
        if (!text) return;
        const chatLevelRow = db.prepare('SELECT gift_level_score FROM users WHERE id = ?').get(wsUser.id);
        const chatLevel = liveGiftLevel(chatLevelRow && chatLevelRow.gift_level_score);
        const item = { type: 'night_room_chat', user_id: String(wsUser.id), name: wsUser.display_name || wsUser.username, photo: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '', level: chatLevel, badge: liveLevelBadge(chatLevel), text, timestamp: Date.now() };
        const history = nightRoomChats.get(ws.nightRoomId) || [];
        history.push(item); if (history.length > 50) history.shift(); nightRoomChats.set(ws.nightRoomId, history);
        nightRoomBroadcast(ws.nightRoomId, item);
        return;
      }
      if (msg.type === 'night_room_mic') {
        const member = ws.nightRoomId && nightRoomFindMember(ws.nightRoomId, ws.nightRoomMemberId);
        if (!member) return;
        member.muted = Boolean(msg.muted);
        nightRoomBroadcast(ws.nightRoomId, { type: 'night_room_mic', user_id: String(member.userId), muted: member.muted });
        return;
      }
      if (msg.type === 'night_room_send_gift') {
        if (!wsUser || !ws.nightRoomId) return;
        const sender = nightRoomFindMember(ws.nightRoomId, wsUser.id);
        const target = nightRoomFindMember(ws.nightRoomId, msg.target_user_id);
        const gift = liveGiftCatalogMap.get(String(msg.gift_id));
        if (!sender || !target || !gift) { liveSend(ws, { type: 'night_room_error', reason: 'invalid_gift_target' }); return; }
        if (String(target.userId) === String(wsUser.id)) { liveSend(ws, { type: 'night_room_error', reason: 'cannot_gift_self' }); return; }
        const giftPrice = Math.max(1, Number(gift.diamond_count) || 1);
        const beforeGift = db.prepare('SELECT gift_level_score FROM users WHERE id = ?').get(wsUser.id);
        const oldLevel = liveGiftLevel(beforeGift && beforeGift.gift_level_score);
        const charged = db.prepare('UPDATE users SET live_tokens = live_tokens - ?, gift_level_score = gift_level_score + ? WHERE id = ? AND live_tokens >= ?').run(giftPrice, giftPrice, wsUser.id, giftPrice);
        if (!charged.changes) { liveSend(ws, { type: 'night_room_error', reason: 'insufficient_tokens' }); return; }
        const updatedTok = db.prepare('SELECT live_tokens, gift_level_score FROM users WHERE id = ?').get(wsUser.id);
        const senderLevel = liveGiftLevel(updatedTok && updatedTok.gift_level_score), senderBadge = liveLevelBadge(senderLevel);
        db.prepare('UPDATE users SET live_tokens = live_tokens + ? WHERE id = ?').run(giftPrice, Number(target.userId));
        const effectId = liveGiftEffectMap.get(String(gift.id)) || null;
        if (effectId) grantNightRoomGiftMedia(ws.nightRoomId, effectId);
        const payload = { type: 'night_room_gift_received', gift_id: gift.id, gift_name: gift.name, gift_price: giftPrice, gift_image: gift.icon, effect_id: effectId, has_animation: Boolean(effectId), sender_name: wsUser.display_name || wsUser.username, sender_id: String(wsUser.id), sender_level: senderLevel, sender_badge: senderBadge, target_user_id: String(target.userId), target_name: target.name };
        nightRoomBroadcast(ws.nightRoomId, payload);
        liveSend(ws, { type: 'live_tokens_update', live_tokens: updatedTok ? updatedTok.live_tokens : 0 });
        const targetBalance = db.prepare('SELECT live_tokens FROM users WHERE id = ?').get(Number(target.userId));
        if (targetBalance) liveSend(target.ws, { type: 'live_tokens_update', live_tokens: targetBalance.live_tokens });
        let supporters = nightRoomGiftSupporters.get(ws.nightRoomId);
        if (!supporters) { supporters = new Map(); nightRoomGiftSupporters.set(ws.nightRoomId, supporters); }
        const key = String(wsUser.id), supporter = supporters.get(key) || { user_id: key, name: wsUser.display_name || wsUser.username, photo: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '', points: 0, level: senderLevel };
        supporter.points += giftPrice; supporter.level = senderLevel; supporters.set(key, supporter);
        nightRoomBroadcast(ws.nightRoomId, { type: 'night_room_gift_leaderboard', supporters: Array.from(supporters.values()).sort((a,b) => b.points - a.points).slice(0, 20) });
        const senderMember = nightRoomFindMember(ws.nightRoomId, wsUser.id);
        if (senderMember) { senderMember.level = senderLevel; senderMember.badge = senderBadge; nightRoomBroadcast(ws.nightRoomId, { type: 'night_room_member_updated', member: nightRoomMemberPayload(senderMember) }); }
        if (senderLevel > oldLevel) nightRoomBroadcast(ws.nightRoomId, { type: 'night_room_level_up', user_id: String(wsUser.id), name: wsUser.display_name || wsUser.username, level: senderLevel, badge: senderBadge });
        return;
      }
      if (msg.type === 'game_refuse') {
        console.log('GAME-REFUSE-TAPILDI!!! wsUser=' + Boolean(wsUser) + ' gameRoom=' + Boolean(ws.gameRoom));
        if (ws.gamePlayer) {
          msg.user = { id: ws.gamePlayer.id, name: ws.gamePlayer.name, male: ws.gamePlayer.male, vip: ws.gamePlayer.vip, pass_premium: ws.gamePlayer.pass_premium, top: ws.gamePlayer.top, photo_url: ws.gamePlayer.photo_url };
        }
        if (ws.refuseSlapActive && wsUser && msg.receiver_id) {
          ws.refuseSlapActive = false;
          addKissLeagueScore(wsUser.id, 1);
          if (ws.gameRoom) {
            broadcastToRoom(ws.gameRoom, null, { type: 'game_turn_booster', user_id: String(wsUser.id), receiver_id: String(msg.receiver_id), booster: 'refuse_slap' });
          }
        }
        if (ws.gameRoom) {
          broadcastToRoom(ws.gameRoom, null, msg);
          console.log('GAME-REFUSE-BROADCAST-EDILDI');
        }
        return;
      }
      if (msg.type === 'pass_claim_level_reward') {
        if (wsUser) {
          const REFERENCE_EPOCH_MS2 = new Date('2026-08-03T02:00:00Z').getTime();
          const dayMs3 = 24 * 60 * 60 * 1000;
          const seasonLengthMs2 = 35 * dayMs3;
          const elapsedSinceRef2 = Date.now() - REFERENCE_EPOCH_MS2;
          const seasonIndex2 = Math.floor(elapsedSinceRef2 / seasonLengthMs2);
          const computedSeasonStart2 = REFERENCE_EPOCH_MS2 + seasonIndex2 * seasonLengthMs2;
          const savedSeasonStart2 = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('season_start_ms');
          const SEASON_START_MS2 = savedSeasonStart2 ? Number(savedSeasonStart2.value) : computedSeasonStart2;
          const rewardRow = db.prepare('SELECT * FROM pass_level_rewards WHERE level = ?').get(msg.level);
          const alreadyClaimed = db.prepare('SELECT 1 FROM pass_claims WHERE user_id = ? AND level = ? AND line = ? AND season_start_ms = ?').get(wsUser.id, msg.level, msg.line, SEASON_START_MS2);
          if (!alreadyClaimed && rewardRow) {
            db.prepare('INSERT INTO pass_claims (user_id, level, line, season_start_ms) VALUES (?, ?, ?, ?)').run(wsUser.id, msg.level, msg.line, SEASON_START_MS2);
            const rewardType = msg.line === 'paid' ? rewardRow.paid_reward_type : rewardRow.free_reward_type;
            const rewardGoldAmt = msg.line === 'paid' ? rewardRow.paid_gold : rewardRow.free_gold;
            const rewardBoosterName = msg.line === 'paid' ? rewardRow.paid_booster : rewardRow.free_booster;
            const rewardBoostersJson = msg.line === 'paid' ? rewardRow.paid_boosters_json : rewardRow.free_boosters_json;
            if (rewardType === 'gold' || rewardType === 'tokens') {
              db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(rewardGoldAmt || 0, wsUser.id);
            } else if (rewardType === 'frame' && rewardBoosterName) {
              const ownedRowPass = db.prepare('SELECT owned_items FROM users WHERE id = ?').get(wsUser.id);
              let ownedItemsPass = {};
              if (ownedRowPass && ownedRowPass.owned_items) { try { ownedItemsPass = JSON.parse(ownedRowPass.owned_items); } catch (e) {} }
              ownedItemsPass[rewardBoosterName] = true;
              db.prepare('UPDATE users SET owned_items = ? WHERE id = ?').run(JSON.stringify(ownedItemsPass), wsUser.id);
            } else if (rewardType === 'booster' && rewardBoostersJson) {
              const ownedRowBst = db.prepare('SELECT owned_items FROM users WHERE id = ?').get(wsUser.id);
              let ownedItemsBst = {};
              if (ownedRowBst && ownedRowBst.owned_items) { try { ownedItemsBst = JSON.parse(ownedRowBst.owned_items); } catch (e) {} }
              try {
                const boosterList = JSON.parse(rewardBoostersJson);
                boosterList.forEach(bItem => {
                  const bId = bItem.id; const bCount = Number(bItem.count) || 1;
                  ownedItemsBst[bId] = (Number(ownedItemsBst[bId]) || 0) + bCount;
                });
              } catch (e) { console.log('WS: booster json parse xetasi - ' + e.message); }
              db.prepare('UPDATE users SET owned_items = ? WHERE id = ?').run(JSON.stringify(ownedItemsBst), wsUser.id);
            } else if (rewardType === 'boosters_multi' && rewardBoostersJson) {
              const ownedRowBm = db.prepare('SELECT owned_items FROM users WHERE id = ?').get(wsUser.id);
              let ownedItemsBm = {};
              if (ownedRowBm && ownedRowBm.owned_items) { try { ownedItemsBm = JSON.parse(ownedRowBm.owned_items); } catch (e) {} }
              try {
                const idList = JSON.parse(rewardBoostersJson);
                idList.forEach(bId => {
                  ownedItemsBm[bId] = (Number(ownedItemsBm[bId]) || 0) + 1;
                });
              } catch (e) { console.log('WS: boosters_multi json parse xetasi - ' + e.message); }
              db.prepare('UPDATE users SET owned_items = ? WHERE id = ?').run(JSON.stringify(ownedItemsBm), wsUser.id);
            }
            console.log('WS: pass mukafati alindi - ' + wsUser.username + ' level=' + msg.level + ' line=' + msg.line + ' type=' + rewardType);
          }
          ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'pass_claim_level_reward', level: msg.level, line: msg.line, reward: { gold: msg.line === 'paid' ? (rewardRow ? rewardRow.paid_gold : 0) : (rewardRow ? rewardRow.free_gold : 0) } }));
        }
        return;
      }      if (!msg.type) {
        if (!ws.packetCounter) ws.packetCounter = 1000;
        if (msg.registration && wsUser) {
          const genderVal = msg.male ? 'male' : 'female';
          db.prepare('UPDATE users SET gender = ?, display_name = ?, game_registered = 1, updated_at = datetime(\'now\') WHERE id = ?')
            .run(genderVal, msg.name || wsUser.username, wsUser.id);
          wsUser = db.prepare('SELECT * FROM users WHERE id = ?').get(wsUser.id);
          console.log('WS: qeydiyyat tamamlandi - ' + wsUser.username + ' gender=' + genderVal);
        } else if (wsUser && !wsUser.game_registered && !wsUser.google_id && !wsUser.facebook_id && !wsUser.telegram_id) {
          const needsRegResponse = {
            type: 'needs_registration',
            packet: ws.packetCounter++,
            name: wsUser.username
          };
          ws.send(encodeMessage(needsRegResponse));
          console.log('WS SENT: needs_registration response');
          return;
        }
      console.log('WS: DEBUG login tokens - wsUser.tokens=' + (wsUser ? wsUser.tokens : 'wsUser_null') + ' wsUser.id=' + (wsUser ? wsUser.id : 'null'));
      const pendingHaremNotifs = wsUser ? db.prepare('SELECT * FROM harem_inbox WHERE user_id = ? AND delivered = 0').all(wsUser.id) : [];
      const haremInboxItems = pendingHaremNotifs.map(function(n) {
        const targetU = db.prepare('SELECT * FROM users WHERE id = ?').get(n.target_id);
        const newOwnerU = db.prepare('SELECT * FROM users WHERE id = ?').get(n.new_owner_id);
        const oldOwnerU = n.old_owner_id ? db.prepare('SELECT * FROM users WHERE id = ?').get(n.old_owner_id) : null;
        return {
          type: 'harem_purchase',
          ts: n.ts,
          price: n.price,
          price_rank: 1,
          target: targetU ? { id: String(targetU.id), name: targetU.display_name || targetU.username, male: targetU.gender !== 'female', photo_url: targetU.avatar_data ? ('/api/avatar/' + targetU.id) : '' } : { id: String(n.target_id), name: '', male: true, photo_url: '' },
          new_owner: newOwnerU ? { id: String(newOwnerU.id), name: newOwnerU.display_name || newOwnerU.username, male: newOwnerU.gender !== 'female', photo_url: newOwnerU.avatar_data ? ('/api/avatar/' + newOwnerU.id) : '' } : { id: String(n.new_owner_id), name: '', male: true, photo_url: '' },
          old_owner: oldOwnerU ? { id: String(oldOwnerU.id), name: oldOwnerU.display_name || oldOwnerU.username, male: oldOwnerU.gender !== 'female', photo_url: oldOwnerU.avatar_data ? ('/api/avatar/' + oldOwnerU.id) : '' } : undefined
        };
      });
      if (wsUser && pendingHaremNotifs.length > 0) {
        db.prepare('UPDATE harem_inbox SET delivered = 1 WHERE user_id = ?').run(wsUser.id);
        console.log('WS: ' + pendingHaremNotifs.length + ' herem bildirisi gonderildi - user=' + wsUser.id);
      }
      const loginResponse = {
        type: 'login',
        packet: ws.packetCounter++,
        abtest: { kickout: true },
        kickout_info: { price: 60, refresh_ms: 60000 },
        league_state: 'active',
        timestamp: Date.now(),
        id: wsUser ? String(wsUser.id) : '1',
        name: wsUser ? (wsUser.display_name || wsUser.username) : 'Oyuncu',
        frame: wsUser ? (wsUser.active_frame || '') : '',
        stone: wsUser ? (wsUser.active_stone || '') : '',
        photo: '',
        tokens_vip: 1,
        block_user_ids: [],
        gifts: [], items: { kiss_fire: [3,2,1,0,0,0,0], refuse_slap: [2,1,1,0,0,0,0], league_kiss2x: [1,1,0,0,0,0,0], league_kiss_lim10: [1,0,0,0,0,0,0], league5: [1,1,1,0,0,0,0] },
        scheduled: [],
        achievements_ms: 0,
        achievements: wsUser && wsUser.achievements ? JSON.parse(wsUser.achievements) : [],
        ih_flags: 0,
        num_friends: 0,
        profile_update_ms: 0,
        inbox: haremInboxItems,
        sex: wsUser && wsUser.gender === 'female' ? 'f' : 'm',
        country: 'AZ',
        city: '',
        rank: 1,
        rank_points: wsUser ? wsUser.points : 0,
        gold: wsUser ? wsUser.coins : 0,
        tokens: wsUser ? wsUser.tokens : 0,
        vip: wsUser ? Boolean(wsUser.is_vip) : false,
        crystals: wsUser ? wsUser.crystals : 0,
        gold_real: wsUser ? wsUser.crystals : 0,
        friendship_pass_active: wsUser && wsUser.friendship_pass_expires && new Date(wsUser.friendship_pass_expires) > new Date(),
        friendship_pass_days_left: (wsUser && wsUser.friendship_pass_expires && new Date(wsUser.friendship_pass_expires) > new Date()) ? Math.ceil((new Date(wsUser.friendship_pass_expires) - new Date()) / (1000 * 60 * 60 * 24)) : 0,
        is_moderator: wsUser ? Boolean(wsUser.is_moderator) : false,
        total_kisses: wsUser ? wsUser.points : 0,
        gestures: [],
        chances: 0,
        harem: [],
        friends: [],
        blocked: []
      };ws.send(encodeMessage(loginResponse));
if (wsUser) {
        const todayLg = new Date().toISOString().slice(0, 10);
        const scoreRowLg = db.prepare('SELECT daily_league_score, daily_league_date, league_tier FROM users WHERE id = ?').get(wsUser.id);
        const myScoreLg = (scoreRowLg && scoreRowLg.daily_league_date === todayLg) ? scoreRowLg.daily_league_score : 0;
        const myTierNameLg = (scoreRowLg && scoreRowLg.league_tier) ? scoreRowLg.league_tier : 'wood';
        const tierOrderListLg = ['wood', 'rock', 'iron', 'steel', 'bronze', 'marble', 'silver', 'gold', 'platinum', 'amber', 'amethyst', 'topaz', 'pearls', 'sapphire', 'ruby', 'emerald', 'diamond'];
        const myLeagueLg = tierOrderListLg.indexOf(myTierNameLg);
        let leagueUsersLg = db.prepare('SELECT id, username, display_name, daily_league_score, avatar_data FROM users WHERE league_tier = ? AND daily_league_date = ? ORDER BY daily_league_score DESC LIMIT 10').all(myTierNameLg, todayLg);
        if (!leagueUsersLg.some(u => u.id === wsUser.id)) {
          const selfRowLg = db.prepare('SELECT id, username, display_name, daily_league_score, avatar_data FROM users WHERE id = ?').get(wsUser.id);
          if (selfRowLg) leagueUsersLg.push(selfRowLg);
        }
        ws.send(encodeMessage({
          packet: ws.packetCounter++,
          type: 'league_start',
          league_state: myScoreLg >= 1 ? 'running' : 'idle',
          league: myLeagueLg,
          max_league: tierOrderListLg.length,
          start_ms: Date.now() - 86400000,
          finish_ms: Date.now() + 6 * 86400000,
          move_up: 3,
          move_down: 3,
          gifts: [],
          items: { kiss_fire: [3,2,1,0,0,0,0], refuse_slap: [2,1,1,0,0,0,0], league_kiss2x: [1,1,0,0,0,0,0], league_kiss_lim10: [1,0,0,0,0,0,0], league5: [1,1,1,0,0,0,0] },
          gold: leagueUsersLg.map((u, i) => i === 0 ? 300 : (i === 1 ? 200 : (i === 2 ? 100 : 0))),
          tokens: leagueUsersLg.map(u => 0),
          users: leagueUsersLg.map((u, i) => ({
            id: String(u.id),
            name: u.display_name || u.username,
            score: u.daily_league_score,
            rank: i + 1,
            photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : ''
          }))
        }));
      }
            console.log('WS SENT: login response');
      console.log('WS DEBUG: wsUser movcuddurmu = ' + Boolean(wsUser) + ' id=' + (wsUser ? wsUser.id : 'YOXDUR'));
      if (wsUser) {
        const today = new Date().toISOString().slice(0, 10);
        const lastClaim = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('daily_bonus_claim_' + wsUser.id);
        if (!lastClaim || lastClaim.value !== today) {
          const dayNum = ((wsUser.daily_bonus_streak || 0) % 5) + 1;
          const goldAmount = dayNum;
          db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(goldAmount, wsUser.id);
          db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('daily_bonus_claim_' + wsUser.id, today);
          ws.send(encodeMessage({
            packet: ws.packetCounter = (ws.packetCounter||1000)+1,
            type: 'gold_daily',
            day: dayNum,
            gold_diff: goldAmount
          }));
          console.log('WS SENT: gold_daily - day=' + dayNum + ' gold=' + goldAmount);
        }
      }
      const myId = wsUser ? String(wsUser.id) : ('guest_' + Math.random().toString(36).slice(2, 8));
      const myName = wsUser ? (wsUser.display_name || wsUser.username) : 'Oyuncu';
      const myMale = !wsUser || wsUser.gender !== 'female';
      if (myId) {
        for (const oldRoom of rooms.values()) {
          for (const [oldWs, oldPlayer] of oldRoom.players.entries()) {
            if (oldPlayer.id === myId && oldWs !== ws) {
              oldRoom.players.delete(oldWs);
              if (oldRoom.stickedGifts) oldRoom.stickedGifts.delete(myId);
              broadcastToRoom(oldRoom, oldWs, { type: 'game_leave', user: { id: myId } });
              if (oldWs.readyState === WebSocket.OPEN) {
                oldWs.send(encodeMessage({ type: 'other_client_shutdown', packet: oldWs.packetCounter = (oldWs.packetCounter||1000)+1 }));
                oldWs.close(4001, 'replaced_by_new_connection');
              }
              console.log('WS: kohne xeyal nusxe silindi - ' + myId);
            }
          }
        }
      }
      let myRoom = null;
      if (myId && lastRoomByUserId.has(myId)) {
        const oldRoomId = lastRoomByUserId.get(myId);
        const oldRoomRef = rooms.get(oldRoomId);
        if (oldRoomRef && oldRoomRef.players.size < MAX_SEATS) {
          myRoom = oldRoomRef;
          console.log('WS: eyni otaga qaytarildi - ' + myId + ' masa=' + oldRoomId);
        }
      }
      if (!myRoom) myRoom = findRoomWithSpace();
      console.log('ROOM-DEBUG: myId=' + myId + ' hasLastRoom=' + (myId ? lastRoomByUserId.has(myId) : 'no-myid') + ' finalRoomId=' + myRoom.gameId + ' chatHistLen=' + (myRoom.chatHistory ? myRoom.chatHistory.length : 0));
      const mySeat = getNextSeatInRoom(myRoom);
      const top10KissIdsGE = db.prepare('SELECT id FROM users WHERE total_kisses > 0 ORDER BY total_kisses DESC LIMIT 10').all().map(function(r) { return r.id; });
      const top10DjIdsGE = db.prepare('SELECT id FROM users WHERE points > 0 ORDER BY points DESC LIMIT 10').all().map(function(r) { return r.id; });
      const top10PriceIdsGE = db.prepare('SELECT id FROM users WHERE price_stat > 0 ORDER BY price_stat DESC LIMIT 10').all().map(function(r) { return r.id; });
      const top10HaremIdsGE = db.prepare('SELECT id FROM users WHERE harem_price_stat > 0 ORDER BY harem_price_stat DESC LIMIT 10').all().map(function(r) { return r.id; });
      const top10GestureIdsGE = db.prepare('SELECT id FROM users WHERE gestures_sent > 0 ORDER BY gestures_sent DESC LIMIT 10').all().map(function(r) { return r.id; });
      const top10Ids = Array.from(new Set([...top10KissIdsGE, ...top10DjIdsGE, ...top10PriceIdsGE, ...top10HaremIdsGE, ...top10GestureIdsGE]));
      const myIsTop = wsUser ? top10Ids.indexOf(wsUser.id) >= 0 : false;
      const tierOrderListMP = ['wood', 'rock', 'iron', 'steel', 'bronze', 'marble', 'silver', 'gold', 'platinum', 'amber', 'amethyst', 'topaz', 'pearls', 'sapphire', 'ruby', 'emerald', 'diamond'];
      let myLeagueMP = 1;
      if (wsUser) {
        const tierNameMP = wsUser.league_tier || 'bronze';
        myLeagueMP = tierOrderListMP.indexOf(tierNameMP);
        if (myLeagueMP < 1) myLeagueMP = 1;
      }
      const myPlayer = { id: myId, name: myName, male: myMale, photo_url: wsUser && wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '', seat: mySeat, kisses: 0, vip: wsUser ? Boolean(wsUser.is_vip) : false, pass_premium: wsUser ? Boolean(wsUser.is_vip) : false, top: myIsTop, frame: wsUser ? (wsUser.active_frame || '') : '', stone: wsUser ? (wsUser.active_stone || '') : '', league: myLeagueMP };
      if (myId && myRoom.stickedGifts.has(myId)) {
        const savedGifts = myRoom.stickedGifts.get(myId);
        if (savedGifts.ava_gift) { myPlayer.ava_gift = savedGifts.ava_gift; myPlayer.ava_gift_random = savedGifts.ava_gift_random; }
        if (savedGifts.hat) myPlayer.hat = savedGifts.hat;
        if (savedGifts.drink) myPlayer.drink = savedGifts.drink;
      }
      const existingParticipants = [];
      myRoom.players.forEach(p => existingParticipants.push(p));
      if (wsUser && isKickedFromRoom(wsUser.id, myRoom.gameId)) {
        ws.send(encodeMessage({ type: 'kickout_info', kickout_ts: wsUser.kicked_until, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
        return;
      }
      myRoom.players.set(ws, myPlayer);
      if (myId) lastRoomByUserId.set(myId, myRoom.gameId);
        if (myId) { try { db.prepare('INSERT INTO visited_rooms (user_id, room_id, last_visited_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(user_id, room_id) DO UPDATE SET last_visited_at = excluded.last_visited_at').run(myId, myRoom.gameId); } catch(e) {} }
      ws.gamePlayer = myPlayer;
      ws.gameRoom = myRoom;
      const gameEnterResponse = {
        type: 'game_enter',
        packet: ws.packetCounter++,
        game_id: myRoom.gameId,
        bottle_type: myRoom.bottleType || 'vipbottle',
        participants: [myPlayer, ...existingParticipants],
        abtest: { kickout: true },
        kickout_info: { price: 60, refresh_ms: 60000 }
      };
      ws.send(encodeMessage(gameEnterResponse));
      console.log('WS SENT: game_enter response - masa: ' + myRoom.gameId + ' oyuncu sayi: ' + myRoom.players.size);
      broadcastToRoom(myRoom, ws, {
        type: 'game_join',
        user: myPlayer
      });
      console.log('CHAT-HISTORY-DEBUG: yeni oyuncu qosuldu, room.chatHistory var mi=' + (myRoom.chatHistory ? myRoom.chatHistory.length : 'YOXDUR'));
      if (myRoom.chatHistory && myRoom.chatHistory.length > 0) {
        const cleanHistory = myRoom.chatHistory.map(function(histMsg) {
          const freshMsg = Object.assign({}, histMsg);
          delete freshMsg.packet;
          return freshMsg;
        });
        ws.send(encodeMessage({ type: 'game_chat_history', messages: cleanHistory, packet: ws.packetCounter = (ws.packetCounter || 1000) + 1 }));
      }
      if (myId) {
        existingParticipants.forEach(function(fellow) {
          if (fellow.id && /^[0-9]+$/.test(fellow.id) && String(fellow.id) !== String(myId)) {
            db.prepare('INSERT INTO played_together (user_id, fellow_id, last_game_id, last_played_at) VALUES (?, ?, ?, datetime(\'now\')) ON CONFLICT(user_id, fellow_id) DO UPDATE SET last_game_id = excluded.last_game_id, last_played_at = excluded.last_played_at').run(myId, Number(fellow.id), myRoom.gameId);
            db.prepare('INSERT INTO played_together (user_id, fellow_id, last_game_id, last_played_at) VALUES (?, ?, ?, datetime(\'now\')) ON CONFLICT(user_id, fellow_id) DO UPDATE SET last_game_id = excluded.last_game_id, last_played_at = excluded.last_played_at').run(Number(fellow.id), myId, myRoom.gameId);
          }
        });
      }
      console.log('WS: DEBUG cari mahni yoxlama - currentSong=' + (myRoom.currentSong ? 'VAR' : 'YOXDUR') + (myRoom.currentSong ? ' yas=' + ((Date.now() - myRoom.currentSong.start_timestamp) / 1000) : ''));
      if (myRoom.currentSong && (Date.now() - myRoom.currentSong.start_timestamp) < ((myRoom.currentSong.duration || 240) * 1000)) {
        const songReplay = Object.assign({}, myRoom.currentSong);
        console.log('WS: DEBUG yeni qowulana mahni gonderilir - title=' + songReplay.title + ' orig_start=' + myRoom.currentSong.start_timestamp + ' indiki=' + Date.now());
        const realElapsedSec = (Date.now() - songReplay.start_timestamp) / 1000;
        const safeDuration = (songReplay.duration || 999) - 5;
        if (realElapsedSec > safeDuration) {
          songReplay.start_timestamp = Date.now() - (safeDuration * 1000);
        }
        setTimeout(() => {
          if (ws.readyState !== 1) return;
          if (!ws.packetCounter) ws.packetCounter = 1000;
          songReplay.packet = ws.packetCounter++;
          ws.send(encodeMessage(songReplay));
        }, 1500);
      }
      startBottleTurn(myRoom);      } else if (msg.type === 'gold2tokens_get') {
        const tokensGetResponse = {
          type: 'gold2tokens_get',
          packet: ws.packetCounter++,
          items: [
            { gold: 3, tokens: 3 },
            { gold: 5, tokens: 10 },
            { gold: 10, tokens: 25 },
            { gold: 30, tokens: 75 },
            { gold: 180, tokens: 450 }
          ]
        };
        ws.send(encodeMessage(tokensGetResponse));
        console.log('WS SENT: gold2tokens_get response');
      } else if (msg.type === 'gold2tokens') {
        if (wsUser) {
          const rate = { 3: 3, 5: 10, 10: 25, 30: 75, 180: 450 };
          const goldSpent = msg.gold || 0;
          const tokensGained = rate[goldSpent] || 0;
          const currentUser2 = db.prepare('SELECT coins FROM users WHERE id = ?').get(wsUser.id);
          if (tokensGained > 0 && currentUser2 && currentUser2.coins >= goldSpent) {
            db.prepare('UPDATE users SET coins = coins - ?, tokens = tokens + ? WHERE id = ?').run(goldSpent, tokensGained, wsUser.id);
            const tokensResponse = {
              type: 'gold2tokens',
              packet: ws.packetCounter++,
              tokens_inc: tokensGained
            };
            ws.send(encodeMessage(tokensResponse));
            console.log('WS: token alindi - ' + wsUser.username + ' gold=' + goldSpent + ' tokens=' + tokensGained);
            const verifyRow = db.prepare('SELECT id, username, tokens FROM users WHERE id = ?').get(wsUser.id);
            console.log('WS: DEBUG yazmadan sonra yoxlama - ' + JSON.stringify(verifyRow));
          } else {
            console.log('WS: token alma redd edildi - kifayet qeder coin yoxdur - ' + wsUser.username);
          }
        }
      } else if (msg.type === 'get_profile') {
        const profileUser = db.prepare('SELECT * FROM users WHERE id = ?').get(msg.user_id);
        console.log('DEBUG-STATUS: user_id=' + msg.user_id + ' status=[' + (profileUser ? profileUser.user_status : 'YOX') + ']');
        const top10KissIds = db.prepare('SELECT id FROM users WHERE total_kisses > 0 ORDER BY total_kisses DESC LIMIT 10').all().map(function(r) { return r.id; });
        const top10DjIds = db.prepare('SELECT id FROM users WHERE points > 0 ORDER BY points DESC LIMIT 10').all().map(function(r) { return r.id; });
        const top10PriceIds = db.prepare('SELECT id FROM users WHERE price_stat > 0 ORDER BY price_stat DESC LIMIT 10').all().map(function(r) { return r.id; });
        const top10HaremIds = db.prepare('SELECT id FROM users WHERE harem_price_stat > 0 ORDER BY harem_price_stat DESC LIMIT 10').all().map(function(r) { return r.id; });
        const top10GestureIds = db.prepare('SELECT id FROM users WHERE gestures_sent > 0 ORDER BY gestures_sent DESC LIMIT 10').all().map(function(r) { return r.id; });
        const top10IdsForProfile = Array.from(new Set([...top10KissIds, ...top10DjIds, ...top10PriceIds, ...top10HaremIds, ...top10GestureIds]));
        let totalKissesRank = null, djScoreRank = null, gesturesRank = null, priceRankVal = null, haremPriceRankVal = null;
        if (profileUser) {
          totalKissesRank = 1 + db.prepare('SELECT COUNT(*) as c FROM users WHERE total_kisses > ?').get(profileUser.total_kisses).c;
          djScoreRank = 1 + db.prepare('SELECT COUNT(*) as c FROM users WHERE points > ?').get(profileUser.points).c;
          gesturesRank = 1 + db.prepare('SELECT COUNT(*) as c FROM users WHERE gestures_sent > ?').get(profileUser.gestures_sent || 0).c;
          priceRankVal = 1 + db.prepare('SELECT COUNT(*) as c FROM users WHERE price_stat > ?').get(profileUser.price_stat || 0).c;
          haremPriceRankVal = 1 + db.prepare('SELECT COUNT(*) as c FROM users WHERE harem_price_stat > ?').get(profileUser.harem_price_stat || 0).c;
        }
        let profileUserAge = 18;
        if (profileUser && profileUser.age) {
          profileUserAge = profileUser.age;
        } else if (profileUser && profileUser.birthdate) {
          try {
            const bd2 = new Date(profileUser.birthdate);
            const today2 = new Date();
            profileUserAge = today2.getFullYear() - bd2.getFullYear();
            const mDiff2 = today2.getMonth() - bd2.getMonth();
            if (mDiff2 < 0 || (mDiff2 === 0 && today2.getDate() < bd2.getDate())) profileUserAge--;
          } catch (e) {}
        }
        let profileUserLeague = 1;
        if (profileUser) {
          const tierOrderListP = ['wood', 'rock', 'iron', 'steel', 'bronze', 'marble', 'silver', 'gold', 'platinum', 'amber', 'amethyst', 'topaz', 'pearls', 'sapphire', 'ruby', 'emerald', 'diamond'];
          const tierNameP = profileUser.league_tier || 'bronze';
          profileUserLeague = tierOrderListP.indexOf(tierNameP);
          if (profileUserLeague < 1) profileUserLeague = 1;
        }
        const profileResponse = {
          type: 'get_profile',
          packet: ws.packetCounter++,
          id: profileUser ? String(profileUser.id) : String(msg.user_id),
          name: profileUser ? (profileUser.display_name || profileUser.username) : 'Oyuncu',
          status: getActiveStatus(profileUser),
          frame: profileUser ? (profileUser.active_frame || '') : '',
          stone: profileUser ? (profileUser.active_stone || '') : '',
          male: profileUser ? profileUser.gender !== 'female' : true,
          photo_url: profileUser && profileUser.avatar_data ? ('/api/avatar/' + profileUser.id) : '',
          locale: 'az',
          vip: profileUser ? Boolean(profileUser.is_vip) : false,
          pass_premium: profileUser ? Boolean(profileUser.is_vip) : false,
          age: profileUserAge,
          league: profileUserLeague,
          city: '',
          country: 'AZ',
          is_new: false,
          top: profileUser ? top10IdsForProfile.indexOf(profileUser.id) >= 0 : false,
          verified: false,
          total_kisses: profileUser ? profileUser.total_kisses : 0,
          points: profileUser ? profileUser.points : 0,
          dj_score: profileUser ? profileUser.points : 0,
          total_kisses_rank: totalKissesRank,
          dj_score_rank: djScoreRank,
          gestures_rank: gesturesRank,
          gestures: profileUser ? (profileUser.gestures_sent || 0) : 0,
          price: 10,
          harem_price: profileUser ? (profileUser.price_stat || 0) : 0,
          price_rank: priceRankVal,
          harem_price_rank: haremPriceRankVal,
          achievements: profileUser && profileUser.achievements ? JSON.parse(profileUser.achievements) : []
        };
        if (profileUser) {
          const ownership2 = db.prepare('SELECT * FROM harem_ownership WHERE target_id = ?').get(profileUser.id);
          if (ownership2 && ownership2.owner_id) {
            const ownerUser = db.prepare('SELECT * FROM users WHERE id = ?').get(ownership2.owner_id);
            if (ownerUser) {
              console.log('WS DEBUG: ownerUser avatar_data movcuddurmu = ' + Boolean(ownerUser.avatar_data) + ' id=' + ownerUser.id + ' username=' + ownerUser.username);
              profileResponse.owner = {
                id: String(ownerUser.id),
                name: ownerUser.display_name || ownerUser.username,
                male: ownerUser.gender !== 'female',
                photo_url: ownerUser.avatar_data ? ('/api/avatar/' + ownerUser.id) : ''
              };
              profileResponse.price = ownership2.price;
            }
          }
        }
        ws.send(encodeMessage(profileResponse));
        console.log('WS SENT: get_profile response');
      } else if (msg.type === 'compliment_next') {
        let complimentReceiver = null;
        if (ws.gameRoom) {
          ws.gameRoom.players.forEach(function(p, clientWs) {
            if (clientWs !== ws && !complimentReceiver) complimentReceiver = p;
          });
        }
        const complimentNextResponse = {
          type: 'compliment_next',
          packet: ws.packetCounter++,
          compliments_to_reward: 5,
          compliments_left: 5,
          group_sent: false,
          reward: { gold: 10 },
          refresh_ms: Date.now(),
          rewarded: false,
          receiver: complimentReceiver ? { id: complimentReceiver.id, name: complimentReceiver.name, male: complimentReceiver.male, photo_url: complimentReceiver.photo_url } : null
        };
        ws.send(encodeMessage(complimentNextResponse));
        console.log('WS SENT: compliment_next response');
      } else if (msg.type === 'compliment_send') {
        if (wsUser) {
          db.prepare('UPDATE users SET coins = coins + 2 WHERE id = ?').run(wsUser.id);
          console.log('WS: kompliment gonderildi - ' + wsUser.username);
        }
        const complimentSendResponse = {
          type: 'compliment_send',
          packet: ws.packetCounter++,
          success: true
        };
        ws.send(encodeMessage(complimentSendResponse));
      } else if (msg.type === 'compliment_group') {
        const complimentGroupResponse = {
          type: 'compliment_group',
          packet: ws.packetCounter++,
          success: true
        };
        ws.send(encodeMessage(complimentGroupResponse));
      } else if (msg.type === 'harem_purchase') {
        if (wsUser) {
          const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(msg.target_id);
          if (targetUser) {
            const ownership = db.prepare('SELECT * FROM harem_ownership WHERE target_id = ?').get(targetUser.id);
            const currentPrice = ownership ? ownership.price : 10;
            const currentOwnerId = ownership ? ownership.owner_id : null;
            if (currentOwnerId === wsUser.id) {
              console.log('WS: harem - artiq ozune aiddir - ' + wsUser.username);
            } else if (wsUser.coins < currentPrice) {
              console.log('WS: harem - kifayet qeder coin yoxdur - ' + wsUser.username);
            } else {
              db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(currentPrice, wsUser.id);
              db.prepare('UPDATE users SET price_stat = COALESCE(price_stat, 0) + ? WHERE id = ?').run(currentPrice, wsUser.id);
              db.prepare("INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'price_period', ?, 'harem_purchase')").run(wsUser.id, currentPrice);
              if (currentOwnerId && currentOwnerId !== wsUser.id) {
                db.prepare('UPDATE users SET price_stat = MAX(0, COALESCE(price_stat, 0) - ?) WHERE id = ?').run(currentPrice, currentOwnerId);
                console.log('WS: evvelki sahibden xal cixarildi - id=' + currentOwnerId + ' -' + currentPrice);
              }
              db.prepare('UPDATE users SET harem_price_stat = ? WHERE id = ?').run(currentPrice, targetUser.id);
              const nextPrice = currentPrice + 1;
              db.prepare('INSERT INTO harem_ownership (target_id, owner_id, price, updated_at) VALUES (?, ?, ?, datetime(\'now\')) ON CONFLICT(target_id) DO UPDATE SET owner_id = excluded.owner_id, price = excluded.price, updated_at = excluded.updated_at').run(targetUser.id, wsUser.id, nextPrice);
              const oldOwner = currentOwnerId ? db.prepare('SELECT * FROM users WHERE id = ?').get(currentOwnerId) : null;
              if (currentOwnerId && !userIdToWs.has(currentOwnerId)) {
                db.prepare('INSERT INTO harem_inbox (user_id, target_id, new_owner_id, old_owner_id, price, ts, delivered) VALUES (?, ?, ?, ?, ?, ?, 0)').run(currentOwnerId, targetUser.id, wsUser.id, currentOwnerId, nextPrice, Date.now());
                console.log('WS: oflayn herem bildirisi yazildi - user=' + currentOwnerId);
              }
              const haremResponse = {
                type: 'harem_purchase',
                packet: ws.packetCounter++,
                ts: Date.now(),
                price: nextPrice,
                price_rank: 1,
                target: { id: String(targetUser.id), name: targetUser.display_name || targetUser.username, male: targetUser.gender !== 'female', photo_url: targetUser.avatar_data ? ('/api/avatar/' + targetUser.id) : '' },
                new_owner: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== 'female', photo_url: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '' },
                old_owner: oldOwner ? { id: String(oldOwner.id), name: oldOwner.display_name || oldOwner.username, male: oldOwner.gender !== 'female', photo_url: oldOwner.avatar_data ? ('/api/avatar/' + oldOwner.id) : '' } : null
              };
              if (ws.gameRoom) { broadcastToRoom(ws.gameRoom, null, haremResponse); } else { ws.send(encodeMessage(haremResponse)); }
              console.log('WS SENT: harem_purchase - ' + wsUser.username + ' -> ' + targetUser.username + ' qiymet=' + currentPrice);
            }
          }
        }
      } else if (msg.type === 'bottle_tap_speedup') {
        if (ws.gameRoom && ws.gameRoom.finishSpin && ws.gameRoom.bottleTimer) {
          clearTimeout(ws.gameRoom.bottleTimer);
          ws.gameRoom.finishSpin();
        }
      } else if (msg.type === 'buy_premium_pass') {
        if (wsUser) {
          const seasonStartRow2 = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('season_start_ms');
          const seasonStart2 = seasonStartRow2 ? Number(seasonStartRow2.value) : Date.now();
          const alreadyHas = db.prepare('SELECT id FROM pass_purchases WHERE user_id = ? AND season_start_ms = ?').get(wsUser.id, seasonStart2);
          if (alreadyHas) {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'premium_pass_error', reason: 'already_active' }));
          } else {
            const currentUser2 = db.prepare('SELECT crystals FROM users WHERE id = ?').get(wsUser.id);
            if (currentUser2.crystals < 500) {
              ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'premium_pass_error', reason: 'not_enough_crystals' }));
            } else {
              db.prepare('UPDATE users SET crystals = crystals - 500 WHERE id = ?').run(wsUser.id);
              db.prepare('INSERT INTO pass_purchases (user_id, season_start_ms) VALUES (?, ?) ON CONFLICT(user_id, season_start_ms) DO NOTHING').run(wsUser.id, seasonStart2);
              ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'premium_pass_purchased' }));
              console.log('WS: premium pass alindi - ' + wsUser.username);
            }
          }
        }
      } else if (msg.type === 'get_favorite_songs') {
        const favSongsResponse = {
          type: 'favorite_songs',
          packet: ws.packetCounter++,
          folder: msg.folder,
          song_ids: [],
          max_items: 30
        };
        ws.send(encodeMessage(favSongsResponse));
        console.log('WS SENT: get_favorite_songs response - ' + msg.folder);
      } else if (msg.type === 'item_purchase') {
        if (wsUser && msg.item) {
          const ITEM_PRICE = 500;
          const validFrames = ['amber','amethyst','angel','carameldecor','cardsdecor','chipsdecor','cinemadecor','daydecor','demon','diamond','discodecor','eastdecor','egyptdecor','emerald','fruitjellydecor','gold','greendecor','hatreddecor','heartsdecor','icedecor','kissesdecor','lavadecor','lovedecor','marsdecor','naturedecor','nightdecor','romedecor','rockdecor','stonedecor','theatredecor','tourismdecor','turbodecor','venusdecor','violetdecor','westdecor'];
          if (validFrames.indexOf(msg.item) < 0) {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'item_purchase_error', reason: 'invalid_item' }));
          } else {
            const currentUserRow = db.prepare('SELECT coins, owned_items FROM users WHERE id = ?').get(wsUser.id);
            let ownedObj = {};
            if (currentUserRow.owned_items) {
              try { ownedObj = JSON.parse(currentUserRow.owned_items); } catch (e) {}
            }
            if (ownedObj[msg.item]) {
              ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'item_purchase', item: msg.item }));
              console.log('WS: element artiq movcuddur - ' + wsUser.username + ' - ' + msg.item);
            } else if (currentUserRow.coins < ITEM_PRICE) {
              ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'item_purchase_error', reason: 'insufficient_coins' }));
              console.log('WS: element alisi reddedildi - kifayet qeder coin yoxdur - ' + wsUser.username);
            } else {
              ownedObj[msg.item] = true;
              db.prepare('UPDATE users SET coins = coins - ?, owned_items = ? WHERE id = ?').run(ITEM_PRICE, JSON.stringify(ownedObj), wsUser.id);
              ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'item_purchase', item: msg.item }));
              console.log('WS: cerceve alindi - ' + wsUser.username + ' - ' + msg.item);
            }
          }
        }} else if (msg.type === 'set_decorations') {
        if (wsUser) {
          const frameVal = msg.frame || '';
          const stoneVal = msg.stone || '';
          let ownedCheck = {};
          const ownedRow2 = db.prepare('SELECT owned_items FROM users WHERE id = ?').get(wsUser.id);
          if (ownedRow2 && ownedRow2.owned_items) {
            try { ownedCheck = JSON.parse(ownedRow2.owned_items); } catch (e) {}
          }
          if (frameVal === '' || ownedCheck[frameVal]) {
            db.prepare('UPDATE users SET active_frame = ?, active_stone = ? WHERE id = ?').run(frameVal, stoneVal, wsUser.id);
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'update_user', user_id: String(wsUser.id), frame: frameVal, stone: stoneVal }));
            console.log('WS: dekorasiya deyisdirildi - ' + wsUser.username + ' - frame=' + frameVal + ' stone=' + stoneVal);
          } else {
            console.log('WS: dekorasiya redd edildi - sahiplenilmemis - ' + wsUser.username + ' - ' + frameVal);
          }
        }} else if (msg.type === 'claim_achievement_bonus') {
        if (wsUser && msg.achievement_id) {
          const achRow2 = db.prepare('SELECT achievements FROM users WHERE id = ?').get(wsUser.id);
          let achList2 = [];
          if (achRow2 && achRow2.achievements) {
            try { achList2 = JSON.parse(achRow2.achievements); } catch (e) {}
          }
          const found = achList2.find(a => a.achievement_id === msg.achievement_id);
          if (found && !found.claimed) {
            const bonusAmount2 = (found.level + 1) * 5;
            db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(bonusAmount2, wsUser.id);
            found.claimed = true;
            db.prepare('UPDATE users SET achievements = ? WHERE id = ?').run(JSON.stringify(achList2), wsUser.id);
            console.log('WS: nailiyyet bonusu balansa kocdu - ' + wsUser.username + ' - ' + msg.achievement_id + ' +' + bonusAmount2 + ' coin');
          } else {
            console.log('WS: nailiyyet bonusu redd edildi - artiq alinib veya tapilmadi - ' + wsUser.username + ' - ' + msg.achievement_id);
          }
        }} else if (msg.type === 'items_get') {
        let ownedItemsObj = {};
        if (wsUser) {
          const ownedRow = db.prepare('SELECT owned_items FROM users WHERE id = ?').get(wsUser.id);
          if (ownedRow && ownedRow.owned_items) {
            try { ownedItemsObj = JSON.parse(ownedRow.owned_items); } catch (e) {}
          }
        }
        const itemsGetResponse = {
          type: 'items_get',
          packet: ws.packetCounter++,
          items: ownedItemsObj
        };
        ws.send(encodeMessage(itemsGetResponse));
        console.log('WS SENT: items_get response - ' + Object.keys(ownedItemsObj).length + ' items');} else if (msg.type === 'items_use') {
        if (wsUser && ['kiss_fire', 'refuse_slap', 'league_kiss2x', 'league_kiss_lim10', 'league5'].indexOf(msg.item) >= 0) {
          const ownedRowKF = db.prepare('SELECT owned_items FROM users WHERE id = ?').get(wsUser.id);
          let ownedKF = {};
          if (ownedRowKF && ownedRowKF.owned_items) { try { ownedKF = JSON.parse(ownedRowKF.owned_items); } catch (e) {} }
          if (ownedKF[msg.item] && ownedKF[msg.item] > 0) {
            ownedKF[msg.item] -= 1;
            db.prepare('UPDATE users SET owned_items = ? WHERE id = ?').run(JSON.stringify(ownedKF), wsUser.id);
            if (msg.item === 'kiss_fire') ws.kissFireActive = true;
            if (msg.item === 'league_kiss2x') ws.leagueKiss2xExpiresAt = Date.now() + 5 * 60 * 1000;
            if (msg.item === 'league_kiss_lim10') {
              const todayLim = new Date().toISOString().slice(0, 10);
              const limRow = db.prepare('SELECT daily_kiss_limit_date, daily_kiss_league_limit FROM users WHERE id = ?').get(wsUser.id);
              if (limRow && limRow.daily_kiss_limit_date === todayLim) {
                db.prepare('UPDATE users SET daily_kiss_league_limit = daily_kiss_league_limit + 10 WHERE id = ?').run(wsUser.id);
              } else {
                db.prepare('UPDATE users SET daily_kiss_league_points = 0, daily_kiss_league_limit = 30, daily_kiss_limit_date = ? WHERE id = ?').run(todayLim, wsUser.id);
              }
            }
            if (msg.item === 'refuse_slap') { ws.refuseSlapActive = true; }
            if (msg.item === 'league5') addDailyLeagueScore(wsUser.id, 5);
            console.log('WS: ' + msg.item + ' istifade edildi - ' + wsUser.username + ' - qalan=' + ownedKF[msg.item]);
          }
        }
      } else if (msg.type === 'get_tops') {
        function toSqliteDateFormat(d) {
          return d.toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
        }
        function getPeriodStart(period) {
          const now = new Date();
          if (period === 'daily') {
            return toSqliteDateFormat(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
          } else if (period === 'weekly') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            return toSqliteDateFormat(new Date(now.getFullYear(), now.getMonth(), diff));
          } else if (period === 'monthly') {
            return toSqliteDateFormat(new Date(now.getFullYear(), now.getMonth(), 1));
          }
          return null;
        }
        function getTopsForPeriod(period, category) {
          const sortColMap = { total_kisses: 'total_kisses', dj_score: 'points', price: 'harem_price_stat', harem_price: 'price_stat', gestures: 'gestures_sent' };
          const sortCol = sortColMap[category] || 'total_kisses';
          if (!period) {
            const topUsers = db.prepare('SELECT * FROM users ORDER BY CAST(' + sortCol + ' AS INTEGER) DESC LIMIT 50').all();
            if (category === 'gestures') console.log('WS: DEBUG SQL raw sirali - sortCol=' + sortCol + ' - ' + JSON.stringify(topUsers.slice(0,5).map(function(u){return {name:u.username, tokens:u.tokens};})));
            return topUsers.map((u, idx) => ({
              id: String(u.id), male: u.gender !== 'female', name: u.display_name || u.username,
              photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : '', total_kisses: u.total_kisses, points: u.points, price: u.harem_price_stat || 0,
              harem_price: u.price_stat || 0, dj_score: u.points, gestures: u.gestures_sent || 0, rank: idx + 1        }));
          }
          const transactionTypeMap = { total_kisses: 'total_kisses_period', dj_score: 'dj_score_period', harem_price: 'price_period', gestures: 'gestures_period' };
          const txType = transactionTypeMap[category];
          if (category !== 'total_kisses' && !txType) {
            const topUsersSnapshot = db.prepare('SELECT * FROM users ORDER BY CAST(' + sortCol + ' AS INTEGER) DESC LIMIT 50').all();
            return topUsersSnapshot.map(function(u, idx) {
              return { id: String(u.id), male: u.gender !== 'female', name: u.display_name || u.username, photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : '', total_kisses: u.total_kisses, points: u.points, price: u.harem_price_stat || 0, harem_price: u.price_stat || 0, dj_score: u.points, gestures: u.gestures_sent || 0, rank: idx + 1 };
            });
          }
          if (category !== 'total_kisses') {
            const periodStartX = getPeriodStart(period);
            const rowsX = db.prepare(
              'SELECT user_id, SUM(amount) as cnt FROM transactions WHERE type = ? AND created_at >= ? GROUP BY user_id ORDER BY cnt DESC LIMIT 50'
            ).all(txType, periodStartX);
            return rowsX.map(function(r, idx) {
              const u = db.prepare('SELECT * FROM users WHERE id = ?').get(r.user_id);
              if (!u) return null;
              const result = { id: String(u.id), male: u.gender !== 'female', name: u.display_name || u.username, photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : '', total_kisses: u.total_kisses, points: u.points, price: u.harem_price_stat || 0, harem_price: u.price_stat || 0, dj_score: u.points, gestures: u.gestures_sent || 0, rank: idx + 1 };
              if (category === 'dj_score') result.dj_score = r.cnt;
              if (category === 'harem_price') result.harem_price = r.cnt;
              if (category === 'gestures') result.gestures = r.cnt;
              return result;
            }).filter(function(x) { return x !== null; });
          }
          const periodStart = getPeriodStart(period);
          const rows = db.prepare(
            "SELECT user_id, SUM(amount) as cnt FROM transactions WHERE type = 'total_kisses_period' AND created_at >= ? GROUP BY user_id ORDER BY cnt DESC LIMIT 50"
          ).all(periodStart);
          return rows.map((r, idx) => {
            const u = db.prepare('SELECT * FROM users WHERE id = ?').get(r.user_id);
            if (!u) return null;
            return {
              id: String(u.id), male: u.gender !== 'female', name: u.display_name || u.username,
              photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : '', total_kisses: r.cnt, points: u.points, price: u.harem_price_stat || 0,
              harem_price: u.price_stat || 0, dj_score: u.points, gestures: u.gestures_sent || 0, rank: idx + 1        };
          }).filter(function(x) { return x !== null; });
        }
        const tops = {};
        (msg.tops || ['points']).forEach(function(sectionName) {
          const parts = sectionName.split(':');
          const period = parts.length > 1 ? parts[1] : null;
          const items = getTopsForPeriod(period, parts[0]).map(function(item) { item[sectionName] = item[parts[0]]; return item; });
          const selfIdx = items.findIndex(function(x) { return wsUser && x.id === String(wsUser.id); });
          tops[sectionName] = {
            top: items,
            self_rank: selfIdx >= 0 ? selfIdx + 1 : null
          };
        });
        const topsResponse = {
          type: 'get_tops',
          packet: ws.packetCounter++,
          tops: tops
        };
        ws.send(encodeMessage(topsResponse));
        console.log('WS SENT: get_tops response');
        if (tops.gestures) console.log('WS: DEBUG gestures top3 - ' + JSON.stringify(tops.gestures.top.slice(0,3).map(function(x){return {name:x.name, gestures:x.gestures};})));
                  } else if (['game_hat', 'game_gift', 'game_drink', 'game_gesture', 'game_kiss', 'send_gift', 'game_chat', 'game_chat_message', 'game_turn_offer', 'game_bottle', 'game_music'].indexOf(msg.type) >= 0) {
        console.log('WS: hediyye/gift mesaji broadcast edilir - ' + msg.type);
        if (wsUser && (msg.type === 'game_chat' || msg.type === 'game_chat_message')) {
          const chatTextToCheck = (msg.body || msg.text || '');
          if (containsBannedWord(chatTextToCheck) || containsPhoneNumber(chatTextToCheck)) {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'chat_blocked', reason: containsPhoneNumber(chatTextToCheck) ? 'phone_number' : 'banned_word' }));
            console.log('WS: mesaj bloklandi (pis soz/nomre) - ' + wsUser.username + ' - ' + chatTextToCheck.substring(0,50));
            return;
          }
          const today = new Date().toISOString().slice(0, 10);
          const msgCountRow = db.prepare('SELECT daily_message_count, daily_message_date FROM users WHERE id = ?').get(wsUser.id);
          if (msgCountRow.daily_message_date !== today) {
            db.prepare('UPDATE users SET daily_message_count = 1, daily_message_date = ? WHERE id = ?').run(today, wsUser.id);
          } else {
            db.prepare('UPDATE users SET daily_message_count = daily_message_count + 1 WHERE id = ?').run(wsUser.id);
          }
          const muteCheck = db.prepare('SELECT muted_until FROM users WHERE id = ?').get(wsUser.id);
          if (muteCheck && muteCheck.muted_until && new Date(muteCheck.muted_until) > new Date()) {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'you_are_muted' }));
            console.log('WS: susdurulmus istifadeci yazmaga cehd etdi - ' + wsUser.username);
            return;
          }
        }
        if (wsUser && ['game_hat', 'game_gift', 'game_drink'].indexOf(msg.type) >= 0) {
          const banCheck = db.prepare('SELECT gift_banned_until FROM users WHERE id = ?').get(wsUser.id);
          if (banCheck && banCheck.gift_banned_until && new Date(banCheck.gift_banned_until) > new Date()) {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'you_are_gift_banned' }));
            console.log('WS: hediyye qadagali istifadeci cehd etdi - ' + wsUser.username);
            return;
          }
        }
        if (['game_hat', 'game_gift', 'game_drink', 'game_gesture'].indexOf(msg.type) >= 0 && wsUser) {
          const giftId = msg.gift_type || msg.hat_type || msg.drink_type || msg.gesture_type || '';
          if (msg.type !== 'game_gesture') {
            const nowTs = Date.now();
            const recentGifts = (ws.recentGameGifts || []).filter(ts => nowTs - ts < 2000);
            if (recentGifts.length >= 100) {
              ws.recentGameGifts = recentGifts;
              return;
            }
            recentGifts.push(nowTs);
            ws.recentGameGifts = recentGifts;
          }
          if (msg.receiver_id && ws.gameRoom) {
            let receiverStillHere = false;
            ws.gameRoom.players.forEach((p) => { if (String(p.id) === String(msg.receiver_id)) receiverStillHere = true; });
            if (!receiverStillHere) {
              console.log('WS: hediyye redd edildi - receiver otaqdan cixib - ' + wsUser.username);
              return;
            }
          }
          const price = GIFT_PRICES[giftId] !== undefined ? GIFT_PRICES[giftId] : 0;
          if (price > 0) {
            const charge = db.prepare('UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?').run(price, wsUser.id, price);
            if (!charge.changes) {
              console.log('WS: hediyye redd edildi - kifayet qeder coin yoxdur - ' + wsUser.username + ' gift=' + giftId + ' price=' + price);
              return;
            }
            addDailyLeagueScore(wsUser.id, 1);
            console.log('WS: hediyye ucun coin cixarildi - ' + wsUser.username + ' gift=' + giftId + ' price=' + price);
            if (msg.receiver_id && ws.gameRoom && ws.gameRoom.currentSong && ws.gameRoom.currentSong.sender && String(ws.gameRoom.currentSong.sender.id) === String(msg.receiver_id)) {
              db.prepare('UPDATE users SET points = points + 1 WHERE id = ?').run(Number(msg.receiver_id));
              db.prepare("INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'dj_score_period', 1, 'kiss_song')").run(Number(msg.receiver_id));
              console.log('WS: DJ-ye hediyye ucun xal artirildi - receiver_id=' + msg.receiver_id);
            }
            if (giftId === 'love' && msg.receiver_id) {
              db.prepare('UPDATE users SET coins = coins + 1 WHERE id = ?').run(msg.receiver_id);
              msg.gold = 1;
              console.log('WS: love hediyyesi bonusu - receiver_id=' + msg.receiver_id + ' +1 coin');
            }
          }
          if (price > 0) {
            const GIFT_ACHIEVEMENT_MAP = { 'snowball': 'snow', 'vodka': 'barman', 'jewelry': 'jewelry', 'pepper': 'pepper', 'frog': 'frog', 'wine': 'sommelier', 'beer': 'barman', 'coffee': 'coffeeman', 'martini': 'barman', 'sweet': 'sweet', 'diamond': 'diamond', 'rose': 'flowers', 'cake': 'tamada', 'teddybear': 'girlfriends', 'bouquet': 'flowers', 'flower': 'flowers', 'gem': 'diamond', 'whiskey': 'barman', 'tomato': 'seniorpomidor' };
            const ACHIEVEMENT_COUNTERS = { 'snow': [5,10,20], 'barman': [5,10,20], 'jewelry': [10,20,50,100,300], 'pepper': [10,20,50,100,300], 'frog': null, 'sommelier': [10,20,50,100,200], 'coffeeman': [5,10,20,50,100], 'sweet': [5,10,20], 'diamond': null, 'flowers': null, 'tamada': [5,10,20,50,100], 'girlfriends': null, 'seniorpomidor': [5,10,20,50,100] };
            const achId = GIFT_ACHIEVEMENT_MAP[giftId];
            if (achId) {
              const achRow = db.prepare('SELECT achievements, achievement_counts FROM users WHERE id = ?').get(wsUser.id);
              let achList = [];
              let countsObj = {};
              if (achRow && achRow.achievements) {
                try { achList = JSON.parse(achRow.achievements); } catch (e) {}
              }
              if (achRow && achRow.achievement_counts) {
                try { countsObj = JSON.parse(achRow.achievement_counts); } catch (e) {}
              }
              const counters = ACHIEVEMENT_COUNTERS[achId];
              const rawCount = (countsObj[achId] || 0) + 1;
              countsObj[achId] = rawCount;
              let newLevel;
              if (!counters) {
                newLevel = 0;
              } else {
                newLevel = -1;
                for (let i = 0; i < counters.length; i++) {
                  if (rawCount >= counters[i]) newLevel = i;
                }
              }
              const existingAch = achList.find(a => a.achievement_id === achId);
              const prevLevel = existingAch ? existingAch.level : -1;
              db.prepare('UPDATE users SET achievement_counts = ? WHERE id = ?').run(JSON.stringify(countsObj), wsUser.id);
              if (newLevel > prevLevel) {
                achList = achList.filter(a => a.achievement_id !== achId);
                achList.push({ achievement_id: achId, timestamp: Date.now(), level: newLevel });
                db.prepare('UPDATE users SET achievements = ? WHERE id = ?').run(JSON.stringify(achList), wsUser.id);
                const bonusAmount = (newLevel + 1) * 5;
                ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'achievement_bonus', user: { id: String(wsUser.id) }, achievement_id: achId, level: newLevel, timestamp: Date.now(), bonus: bonusAmount }));
                console.log('WS: nailiyyet artirildi - ' + wsUser.username + ' - ' + achId + ' seviyye=' + newLevel + ' say=' + rawCount);
                if (ws.gameRoom) {
                  broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: '\u2b50 ' + (wsUser.display_name || wsUser.username) + ' yeni nailiyyet qazandi: ' + achId + ' (seviyye ' + (newLevel + 1) + ')', receiver_id: '', receiver_name: '', user: { id: '0', name: 'Sistem', male: true } });
                }
              } else {
                console.log('WS: nailiyyet sayi artirildi (seviyye deyismedi) - ' + wsUser.username + ' - ' + achId + ' say=' + rawCount);
              }
            }
          }
if (msg.receiver_id && ws.gameRoom) {
            if (!ws.gameRoom.stickedGifts.has(msg.receiver_id)) ws.gameRoom.stickedGifts.set(msg.receiver_id, {});
            const savedForUser = ws.gameRoom.stickedGifts.get(msg.receiver_id);
            if (msg.type === 'game_gift') {
              savedForUser.ava_gift = giftId;
              savedForUser.ava_gift_random = msg.random || 0;
            } else if (msg.type === 'game_hat') {
              savedForUser.hat = giftId;
            } else if (msg.type === 'game_drink') {
              savedForUser.drink = giftId;
            }
            const receiverPlayerForStick = ws.gameRoom.players.get([...ws.gameRoom.players.keys()].find(function(k) { return ws.gameRoom.players.get(k).id === msg.receiver_id; }));
            if (receiverPlayerForStick) {
              if (savedForUser.ava_gift) { receiverPlayerForStick.ava_gift = savedForUser.ava_gift; receiverPlayerForStick.ava_gift_random = savedForUser.ava_gift_random; }
              if (savedForUser.hat) receiverPlayerForStick.hat = savedForUser.hat;
              if (savedForUser.drink) receiverPlayerForStick.drink = savedForUser.drink;
            }
          }
          if (wsUser && giftId && ACHIEVEMENTS[giftId] && ACHIEVEMENTS[giftId].counters) {
            const counters = ACHIEVEMENTS[giftId].counters;
            const progressRow = db.prepare('SELECT * FROM gift_achievement_progress WHERE user_id = ? AND gift_type = ?').get(wsUser.id, giftId);
            const newCount = (progressRow ? progressRow.count : 0) + 1;
            let newLevel = progressRow ? progressRow.last_level : 0;
            let leveledUp = false;
            for (let i = 0; i < counters.length; i++) {
              if (newCount >= counters[i] && (i + 1) > newLevel) {
                newLevel = i + 1;
                leveledUp = true;
              }
            }
            db.prepare('INSERT INTO gift_achievement_progress (user_id, gift_type, count, last_level) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, gift_type) DO UPDATE SET count = excluded.count, last_level = excluded.last_level').run(wsUser.id, giftId, newCount, newLevel);
            if (leveledUp) {
              const bonusAmount = newLevel * 10;
              db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(bonusAmount, wsUser.id);
              ws.send(encodeMessage({
                packet: ws.packetCounter = (ws.packetCounter||1000)+1,
                type: 'achievement_bonus',
                packet: ws.packetCounter++,
                user: { id: String(wsUser.id) },
                achievement_id: giftId,
                level: newLevel,
                timestamp: Date.now(),
                bonus: bonusAmount
              }));
              console.log('WS: nailiyyet acildi - ' + wsUser.username + ' gift=' + giftId + ' level=' + newLevel + ' bonus=' + bonusAmount);
            }
          }
        }
        if (['game_hat', 'game_gift', 'game_drink', 'game_gesture'].indexOf(msg.type) >= 0 && wsUser) {
          db.prepare('UPDATE users SET pass_score = pass_score + 10 WHERE id = ?').run(wsUser.id);
          if (msg.type === 'game_gesture') {
            const gCurrentUser = db.prepare('SELECT tokens FROM users WHERE id = ?').get(wsUser.id);
            if (!gCurrentUser || gCurrentUser.tokens < 1) {
              console.log('WS: smaylik redd edildi - kifayet qeder token yoxdur - ' + wsUser.username);
            } else {
              db.prepare('UPDATE users SET tokens = tokens - 1, gestures_sent = gestures_sent + 1 WHERE id = ?').run(wsUser.id);
              wsUser.tokens = wsUser.tokens - 1;
              wsUser.gestures_sent = (wsUser.gestures_sent || 0) + 1;
              db.prepare("INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'gestures_period', 1, 'gesture')").run(wsUser.id);
              console.log('WS: smaylik xerclendi - ' + wsUser.username + ' -1 token');
            }
          }
          console.log('WS: pass_score artirildi - ' + wsUser.username);
        }
        if (msg.type === 'game_turn_offer') {
          if (ws.gameRoom) {
            var hasMale = false, hasFemale = false;
            ws.gameRoom.players.forEach(function(p) {
              if (p.male) hasMale = true; else hasFemale = true;
            });
            if (!hasMale || !hasFemale) {
              console.log('WS: sise firlatma bloklandi - masada hem oglan hem qiz olmalidir');
              return;
            }
          }
        }if (msg.type === 'game_bottle' && ws.gameRoom) {
          if (msg.bottle_type) {
            ws.gameRoom.bottleType = msg.bottle_type;
            console.log('WS: masanin sise tipi deyisdirildi - masa=' + ws.gameRoom.gameId + ' - ' + msg.bottle_type);
            broadcastToRoom(ws.gameRoom, null, { type: 'game_bottle', bottle_type: msg.bottle_type });
          }
          if (!ws.gameRoom.pendingSpin && !ws.gameRoom.bottleTimer) {
            startBottleTurn(ws.gameRoom);
          }
        }
if (msg.type === 'game_chat_message') {
          msg.type = 'game_chat';
          msg.text = msg.body;
          msg.timestamp = Date.now();
        }
        if (msg.type === 'game_kiss' && wsUser && ws.gameRoom) {
          let receiverPlayer2 = null;
          ws.gameRoom.players.forEach(function(p) { if (p.id === msg.receiver_id) receiverPlayer2 = p; });
          if (receiverPlayer2 && /^[0-9]+$/.test(receiverPlayer2.id)) {
            const kissFireMultiplier = ws.kissFireActive ? 2 : 1;
            ws.kissFireActive = false;
            db.prepare('UPDATE users SET total_kisses = total_kisses + ? WHERE id = ?').run(kissFireMultiplier, Number(receiverPlayer2.id));
            if (ws.gameRoom && ws.gameRoom.currentSong && ws.gameRoom.currentSong.sender && String(ws.gameRoom.currentSong.sender.id) === String(receiverPlayer2.id)) {
              db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(kissFireMultiplier, Number(receiverPlayer2.id));
              db.prepare("INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'dj_score_period', ?, 'kiss_song')").run(Number(receiverPlayer2.id), kissFireMultiplier);
              console.log('WS: DJ-ye opus ucun xal artirildi (x' + kissFireMultiplier + ') - ' + receiverPlayer2.name);
            }
            console.log('WS: opus alan ' + receiverPlayer2.name + ' xali artirildi');
            db.prepare("INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'total_kisses_period', 1, 'kiss')").run(Number(receiverPlayer2.id));
            addDailyLeagueScore(Number(receiverPlayer2.id), 1);
            if (kissFireMultiplier === 2) {
              broadcastToRoom(ws.gameRoom, null, { type: 'game_turn_booster', user_id: String(wsUser ? wsUser.id : ''), receiver_id: String(receiverPlayer2.id), booster: 'kiss_fire' });
            }
            if (wsUser) { const leagueMult = (ws.leagueKiss2xExpiresAt && Date.now() < ws.leagueKiss2xExpiresAt) ? 2 : 1; addKissLeagueScore(wsUser.id, leagueMult); }
          }
        }
        if (msg.type === 'game_gift' && msg.gift_type === 'air_kiss' && wsUser && ws.gameRoom) {
          let receiverPlayer3 = null;
          ws.gameRoom.players.forEach(function(p) { if (p.id === msg.receiver_id) receiverPlayer3 = p; });
          if (receiverPlayer3 && /^[0-9]+$/.test(receiverPlayer3.id)) {
            db.prepare('UPDATE users SET total_kisses = total_kisses + 1 WHERE id = ?').run(Number(receiverPlayer3.id));
            if (ws.gameRoom && ws.gameRoom.currentSong && ws.gameRoom.currentSong.sender && String(ws.gameRoom.currentSong.sender.id) === String(receiverPlayer3.id)) {
              db.prepare('UPDATE users SET points = points + 1 WHERE id = ?').run(Number(receiverPlayer3.id));
              db.prepare("INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'dj_score_period', 1, 'air_kiss_song')").run(Number(receiverPlayer3.id));
              console.log('WS: DJ-ye hediyye-opus ucun xal artirildi - ' + receiverPlayer3.name);
            }
            console.log('WS: hediyye opusu alan ' + receiverPlayer3.name + ' xali artirildi');
            db.prepare("INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'total_kisses_period', 1, 'gift_kiss')").run(Number(receiverPlayer3.id));
          }
        }
        console.log('DEBUG-BEFORE-GAMEPLAYER-CHECK: type=' + msg.type + ' has_gamePlayer=' + Boolean(ws.gamePlayer));
        if (ws.gamePlayer) {
          msg.user = { id: ws.gamePlayer.id, name: ws.gamePlayer.name, male: ws.gamePlayer.male, vip: ws.gamePlayer.vip, pass_premium: ws.gamePlayer.pass_premium, top: ws.gamePlayer.top, photo_url: ws.gamePlayer.photo_url }; console.log('DEBUG-AFTER-USER-ASSIGN: type=' + msg.type);
        }
        if (msg.receiver_id && ws.gameRoom) {
          let receiverPlayer = null;
          ws.gameRoom.players.forEach(p => { if (p.id === msg.receiver_id) receiverPlayer = p; });
          if (receiverPlayer) {
            msg.receiver = { id: receiverPlayer.id, name: receiverPlayer.name, male: receiverPlayer.male, photo_url: receiverPlayer.photo_url };
          }
        }
        console.log('DEBUG-BEFORE-MUSIC-CHECK: type=' + msg.type); if (msg.type === 'game_music' && ws.gamePlayer) {
          if (wsUser) {
            db.prepare('UPDATE users SET coins = coins - 5 WHERE id = ?').run(wsUser.id);
            console.log('WS: mahni ucun coin cixarildi - ' + wsUser.username + ' duration=' + msg.duration + ' title=' + msg.title);
            const djScoreAmt = (msg.provider === 'cz') ? 5 : 9;
            db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(djScoreAmt, wsUser.id);
            db.prepare("INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, 'dj_score_period', ?, 'song_send')").run(wsUser.id, djScoreAmt);           console.log('WS: mahni gonderdiyi ucun xal artirildi - ' + wsUser.username);
          }
          msg.sender = { id: ws.gamePlayer.id, name: ws.gamePlayer.name, male: ws.gamePlayer.male, photo_url: ws.gamePlayer.photo_url };
          msg.start_timestamp = Date.now();
          msg.song_id = msg.id;
          if (msg.provider === 'cz') {
            try {
              const cacheKey = ((msg.artist || '') + '|' + (msg.title || '')).toLowerCase().trim();
              const cached = db.prepare('SELECT * FROM youtube_cache WHERE song_key = ?').get(cacheKey);
              if (cached) {
                msg.provider = 'yt';
                msg.id = cached.video_id;
                msg.song_id = cached.video_id;
                msg.url = '';
                msg.duration = cached.duration || msg.duration;
                console.log('WS: mahni keshden tapildi - ' + msg.title + ' -> videoId=' + cached.video_id);
              } else {
                const apiKey = process.env.YOUTUBE_API_KEY;
                if (apiKey) {
                  const searchQuery = encodeURIComponent((msg.artist || '') + ' ' + (msg.title || ''));
                  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${searchQuery}&key=${apiKey}`;
                  const ytRes = await fetch(searchUrl);
                  const ytData = await ytRes.json();
                  if (ytData.items && ytData.items[0]) {
                    const videoId = ytData.items[0].id.videoId;
                    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;
                    const detailsRes = await fetch(detailsUrl);
                    const detailsData = await detailsRes.json();
                    const ytDuration = detailsData.items && detailsData.items[0] ? parseYoutubeDuration(detailsData.items[0].contentDetails.duration) : msg.duration;
                    db.prepare('INSERT INTO youtube_cache (song_key, video_id, duration) VALUES (?, ?, ?) ON CONFLICT(song_key) DO UPDATE SET video_id = excluded.video_id, duration = excluded.duration').run(cacheKey, videoId, ytDuration);
                    msg.provider = 'yt';
                    msg.id = videoId;
                    msg.song_id = videoId;
                    msg.url = '';
                    msg.duration = ytDuration || msg.duration;
                    console.log('WS: mahni youtube-dan tapildi ve keshlendi - ' + msg.title + ' -> videoId=' + videoId);
                  } else {
                    console.log('WS: youtube-da tapilmadi - ' + msg.title);
                  }
                }
              }
            } catch (ytErr) {
              console.log('WS: youtube axtaris xetasi - ' + ytErr.message);
            }
          }
          if (ws.gameRoom) { ws.gameRoom.currentSong = Object.assign({}, msg); }
        }
        if (ws.gameRoom) {
          console.log('DEBUG-ENTERED-BCAST-BLOCK: type=' + msg.type);
          if (msg.type === 'game_chat' && ws.gameRoom) {
            if (!ws.gameRoom.chatHistory) ws.gameRoom.chatHistory = [];
            ws.gameRoom.chatHistory.push(msg);
            if (ws.gameRoom.chatHistory.length > 20) ws.gameRoom.chatHistory.shift();
            console.log('CHAT-HISTORY-DEBUG: mesaj saxlanildi, hazirki uzunluk=' + ws.gameRoom.chatHistory.length + ' msg=' + JSON.stringify(msg).substring(0,300));
          }
          console.log('DEBUG-BROADCAST-CATDI: type=' + msg.type); broadcastToRoom(ws.gameRoom, null, msg);if (msg.type === 'game_music') {
            const chatMsg = Object.assign({}, msg, { type: 'game_music_chat' });
            broadcastToRoom(ws.gameRoom, null, chatMsg);
            if (wsUser) {
              const todayMusic = new Date().toISOString().slice(0, 10);
              const musicCountRow = db.prepare('SELECT daily_message_count, daily_message_date FROM users WHERE id = ?').get(wsUser.id);
              if (musicCountRow.daily_message_date !== todayMusic) {
                db.prepare('UPDATE users SET daily_message_count = 1, daily_message_date = ? WHERE id = ?').run(todayMusic, wsUser.id);
              } else {
                db.prepare('UPDATE users SET daily_message_count = daily_message_count + 1 WHERE id = ?').run(wsUser.id);
              }
              const musicOnlyRow = db.prepare('SELECT daily_music_date FROM users WHERE id = ?').get(wsUser.id);
              const musicScoreAmt = (msg.provider === 'cz') ? 5 : 9; console.log('MUSIC-SCORE-DEBUG: provider=' + msg.provider + ' amt=' + musicScoreAmt);
              if (musicOnlyRow.daily_music_date !== todayMusic) {
                db.prepare('UPDATE users SET daily_music_count = ?, daily_music_date = ? WHERE id = ?').run(musicScoreAmt, todayMusic, wsUser.id);
              } else {
                db.prepare('UPDATE users SET daily_music_count = daily_music_count + ? WHERE id = ?').run(musicScoreAmt, wsUser.id);
              }
            }
          }
        }} else if (msg.type === 'live_start') {
        if (wsUser) {
          liveStreams.set(wsUser.id, { hostWs: ws, hostId: wsUser.id, hostName: wsUser.display_name || wsUser.username, viewers: new Set() });
          ws.send(encodeMessage({ type: 'live_start', packet: ws.packetCounter = (ws.packetCounter||1000)+1, success: true }));
          console.log('WS: canli yayin baslandi - ' + wsUser.username);
        }
      } else if (msg.type === 'live_end') {
        if (wsUser && liveStreams.has(wsUser.id)) {
          const stream = liveStreams.get(wsUser.id);
          stream.viewers.forEach(viewerWs => {
            viewerWs.send(encodeMessage({ type: 'live_ended', packet: viewerWs.packetCounter = (viewerWs.packetCounter||1000)+1, host_id: wsUser.id }));
          });
          liveStreams.delete(wsUser.id);
          console.log('WS: canli yayin bitdi - ' + wsUser.username);
        }
      } else if (msg.type === 'live_frame') {
        if (wsUser && liveStreams.has(wsUser.id)) {
          const stream = liveStreams.get(wsUser.id);
          stream.viewers.forEach(viewerWs => {
            if (viewerWs.readyState === WebSocket.OPEN) {
              viewerWs.send(encodeMessage({ type: 'live_frame', packet: viewerWs.packetCounter = (viewerWs.packetCounter||1000)+1, frame: msg.frame, host_id: wsUser.id }));
            }
          });
        }
      } else if (msg.type === 'live_audio') {
        if (wsUser && liveStreams.has(wsUser.id)) {
          const streamA = liveStreams.get(wsUser.id);
          streamA.viewers.forEach(viewerWsA => {
            if (viewerWsA.readyState === WebSocket.OPEN) {
              viewerWsA.send(encodeMessage({ type: 'live_audio', packet: viewerWsA.packetCounter = (viewerWsA.packetCounter||1000)+1, audio: msg.audio, host_id: wsUser.id }));
            }
          });
        }
      } else if (msg.type === 'live_join') {
        const hostId = Number(msg.host_id);
        if (liveStreams.has(hostId)) {
          const stream = liveStreams.get(hostId);
          stream.viewers.add(ws);
          ws.watchingLiveHostId = hostId;
          ws.send(encodeMessage({ type: 'live_joined', packet: ws.packetCounter = (ws.packetCounter||1000)+1, host_id: hostId, host_name: stream.hostName }));
        } else {
          ws.send(encodeMessage({ type: 'live_not_found', packet: ws.packetCounter = (ws.packetCounter||1000)+1 }));
        }
      } else if (msg.type === 'live_leave') {
        if (ws.watchingLiveHostId && liveStreams.has(ws.watchingLiveHostId)) {
          liveStreams.get(ws.watchingLiveHostId).viewers.delete(ws);
        }
      } else if (msg.type === 'live_chat') {
        if (wsUser && msg.host_id) {
          const hostId2 = Number(msg.host_id);
          if (liveStreams.has(hostId2)) {
            const stream2 = liveStreams.get(hostId2);
            const chatMsg2 = { type: 'live_chat', packet: 1, user: { id: wsUser.id, name: wsUser.display_name || wsUser.username }, text: msg.text };
            stream2.viewers.forEach(v => v.send(encodeMessage(Object.assign({}, chatMsg2, { packet: v.packetCounter = (v.packetCounter||1000)+1 }))));
            if (stream2.hostWs.readyState === WebSocket.OPEN) stream2.hostWs.send(encodeMessage(Object.assign({}, chatMsg2, { packet: stream2.hostWs.packetCounter = (stream2.hostWs.packetCounter||1000)+1 })));
          }
        }
      } else if (msg.type === 'live_gift') {
        if (wsUser && msg.host_id) {
          const hostId3 = Number(msg.host_id);
          const giftTokenCost = Number(msg.token_cost) || 1;
          const senderRow = db.prepare('SELECT tokens FROM users WHERE id = ?').get(wsUser.id);
          if (senderRow && senderRow.tokens >= giftTokenCost) {
            db.prepare('UPDATE users SET tokens = tokens - ? WHERE id = ?').run(giftTokenCost, wsUser.id);
            db.prepare('UPDATE users SET live_balance = COALESCE(live_balance, 0) + ? WHERE id = ?').run(giftTokenCost, hostId3);
            if (liveStreams.has(hostId3)) {
              const stream3 = liveStreams.get(hostId3);
              const giftMsg = { type: 'live_gift', packet: 1, user: { id: wsUser.id, name: wsUser.display_name || wsUser.username }, gift_id: msg.gift_id, token_cost: giftTokenCost };
              stream3.viewers.forEach(v => v.send(encodeMessage(Object.assign({}, giftMsg, { packet: v.packetCounter = (v.packetCounter||1000)+1 }))));
              if (stream3.hostWs.readyState === WebSocket.OPEN) stream3.hostWs.send(encodeMessage(Object.assign({}, giftMsg, { packet: stream3.hostWs.packetCounter = (stream3.hostWs.packetCounter||1000)+1 })));
            }
          }
        }
      }if (msg.type === 'bottle_click') {
        if (ws.gameRoom && ws.gameRoom.pendingSpin && ws.gameRoom.pendingSpin.active && wsUser && String(ws.gameRoom.pendingSpin.active.p.id) === String(wsUser.id)) {
          if (ws.gameRoom.bottleTimer) {
            clearTimeout(ws.gameRoom.bottleTimer);
            ws.gameRoom.bottleTimer = null;
          }
          if (ws.gameRoom.finishSpin) {
            ws.gameRoom.finishSpin();
            console.log('WS: butulka klikle firlandi - ' + wsUser.username);
          }
          if (Math.random() < 0.1) {
            db.prepare('UPDATE users SET coins = coins + 1 WHERE id = ?').run(wsUser.id);
            ws.send(encodeMessage({ packet: ws.packetCounter++, type: 'game_lucky_gold', amount: 1, user: { id: String(wsUser.id), name: wsUser.username } }));
            console.log('WS: sansl² qizil verildi - ' + wsUser.username);
          }
        }} else if (msg.type === 'game_turn' && msg.packet === undefined) {
        if (ws.gameRoom && ws.gameRoom.pendingSpin && ws.gameRoom.pendingSpin.active && wsUser && String(ws.gameRoom.pendingSpin.active.p.id) === String(wsUser.id)) {
          if (ws.gameRoom.bottleTimer) {
            clearTimeout(ws.gameRoom.bottleTimer);
            ws.gameRoom.bottleTimer = null;
          }
          if (ws.gameRoom.finishSpin) {
            ws.gameRoom.finishSpin();
            console.log('WS: butulka (v2) klikle firlandi - ' + wsUser.username);
          }
          if (Math.random() < 0.1) {
            db.prepare('UPDATE users SET coins = coins + 1 WHERE id = ?').run(wsUser.id);
            ws.send(encodeMessage({ packet: ws.packetCounter++, type: 'game_lucky_gold', amount: 1, user: { id: String(wsUser.id), name: wsUser.username } }));
            console.log('WS: sansli qizil (v2) verildi - ' + wsUser.username);
          }
        }
      } else if (msg.type === 'game_turn' && msg.packet === undefined) {
        if (ws.gameRoom && ws.gameRoom.pendingSpin && ws.gameRoom.pendingSpin.active && wsUser && String(ws.gameRoom.pendingSpin.active.p.id) === String(wsUser.id)) {
          if (ws.gameRoom.bottleTimer) {
            clearTimeout(ws.gameRoom.bottleTimer);
            ws.gameRoom.bottleTimer = null;
          }
          if (ws.gameRoom.finishSpin) {
            ws.gameRoom.finishSpin();
            console.log('WS: butulka (v2) klikle firlandi - ' + wsUser.username);
          }
          if (Math.random() < 0.1) {
            db.prepare('UPDATE users SET coins = coins + 1 WHERE id = ?').run(wsUser.id);
            ws.send(encodeMessage({ packet: ws.packetCounter++, type: 'game_lucky_gold', amount: 1, user: { id: String(wsUser.id), name: wsUser.username } }));
            console.log('WS: sansli qizil (v2) verildi - ' + wsUser.username);
          }
        }
      } else if (msg.type === 'league_info') {
        const todayLeague = new Date().toISOString().slice(0, 10);
        const scoreRow = wsUser ? db.prepare('SELECT daily_league_score, daily_league_date, league_tier FROM users WHERE id = ?').get(wsUser.id) : null;
        const myScore = (scoreRow && scoreRow.daily_league_date === todayLeague) ? scoreRow.daily_league_score : 0;
        const myTierName = (scoreRow && scoreRow.league_tier) ? scoreRow.league_tier : 'bronze';
        const tierOrderList = ['wood', 'rock', 'iron', 'steel', 'bronze', 'marble', 'silver', 'gold', 'platinum', 'amber', 'amethyst', 'topaz', 'pearls', 'sapphire', 'ruby', 'emerald', 'diamond'];
        const myLeague = tierOrderList.indexOf(myTierName);
        const leagueUsers = db.prepare('SELECT id, username, display_name, daily_league_score, avatar_data FROM users WHERE league_tier = ? AND daily_league_date = ? ORDER BY daily_league_score DESC LIMIT 10').all(myTierName, todayLeague);
        ws.send(encodeMessage({
          packet: ws.packetCounter = (ws.packetCounter||1000)+1,
          type: 'league_info',
          league_state: myScore >= 1 ? 'running' : 'idle',
          league: myLeague,
          max_league: tierOrderList.length,
          start_ms: Date.now() - 86400000,
          finish_ms: Date.now() + 6 * 86400000,
          move_up: 3,
          move_down: 3,
          gifts: [], items: { kiss_fire: [3,2,1,0,0,0,0], refuse_slap: [2,1,1,0,0,0,0], league_kiss2x: [1,1,0,0,0,0,0], league_kiss_lim10: [1,0,0,0,0,0,0], league5: [1,1,1,0,0,0,0] },
          gold: leagueUsers.map((u, i) => i === 0 ? 300 : (i === 1 ? 200 : (i === 2 ? 100 : 0))),
          tokens: leagueUsers.map(u => 0),
          users: leagueUsers.map((u, i) => ({
            id: String(u.id),
            name: u.display_name || u.username,
            score: u.daily_league_score,
            rank: i + 1,
            photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : ''
          }))
        }));} else if (msg.type === 'pass_info') {
        const REFERENCE_EPOCH_MS = new Date('2026-08-03T02:00:00Z').getTime();
        const dayMs2 = 24 * 60 * 60 * 1000;
        const seasonLengthMs = 35 * dayMs2;
        const elapsedSinceRef = Date.now() - REFERENCE_EPOCH_MS;
        const seasonIndex = Math.floor(elapsedSinceRef / seasonLengthMs);
        const computedSeasonStart = REFERENCE_EPOCH_MS + seasonIndex * seasonLengthMs;
        const savedSeasonStart = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('season_start_ms');
        const SEASON_START_MS = savedSeasonStart ? Number(savedSeasonStart.value) : computedSeasonStart;
                const daysSinceStart = Math.floor((Date.now() - SEASON_START_MS) / dayMs2);
        const userPassScore = wsUser ? (db.prepare('SELECT pass_score FROM users WHERE id = ?').get(wsUser.id) || {}).pass_score || 0 : 0;
        let currentLevelByScore = 0;
        for (let lv = 1; lv <= 34; lv++) {
          if (userPassScore >= lv * 100) currentLevelByScore = lv;
        }
        const currentLevel = currentLevelByScore;
        const rewardsMap = {};
        db.prepare('SELECT * FROM pass_level_rewards').all().forEach(function(r) { rewardsMap[r.level] = r; });
        const passLevels = [];
        for (let i = 0; i < 35; i++) {
          passLevels.push({
            level: i,
            score: i * 100,
            gold: (rewardsMap[i] ? rewardsMap[i].free_gold : (10 + i * 5)),
            start_ms: Math.floor((SEASON_START_MS + i * dayMs2) / 1000),
            free: { claimed: wsUser ? Boolean(db.prepare('SELECT 1 FROM pass_claims WHERE user_id = ? AND level = ? AND line = ? AND season_start_ms = ?').get(wsUser.id, i, 'free', SEASON_START_MS)) : false, gold: (rewardsMap[i] ? rewardsMap[i].free_gold : (10 + i * 5)), tokens: (rewardsMap[i] && rewardsMap[i].free_reward_type === 'tokens' ? rewardsMap[i].free_gold : 0), items: (function(){
              if (!rewardsMap[i]) return undefined;
              if (rewardsMap[i].free_boosters_json) { var arr = JSON.parse(rewardsMap[i].free_boosters_json); var o = {}; arr.forEach(function(b){ if (typeof b === 'string') { o[b] = 1; } else { o[b.id] = b.count; } }); return o; }
              if (rewardsMap[i].free_reward_type === 'booster' && rewardsMap[i].free_booster) { var o2 = {}; o2[rewardsMap[i].free_booster] = 1; return o2; }
              return undefined;
            })() },
            paid: { claimed: wsUser ? Boolean(db.prepare('SELECT 1 FROM pass_claims WHERE user_id = ? AND level = ? AND line = ? AND season_start_ms = ?').get(wsUser.id, i, 'paid', SEASON_START_MS)) : false, gold: (rewardsMap[i] ? rewardsMap[i].paid_gold : (10 + i * 5) * 2), tokens: (rewardsMap[i] && rewardsMap[i].paid_reward_type === 'tokens' ? rewardsMap[i].paid_gold : 0), items: (function(){
              if (!rewardsMap[i]) return undefined;
              if (rewardsMap[i].paid_boosters_json) { var arr = JSON.parse(rewardsMap[i].paid_boosters_json); var o = {}; arr.forEach(function(b){ if (typeof b === 'string') { o[b] = 1; } else { o[b.id] = b.count; } }); return o; }
              if ((rewardsMap[i].paid_reward_type === 'booster' || rewardsMap[i].paid_reward_type === 'frame') && rewardsMap[i].paid_booster) { var o2 = {}; o2[rewardsMap[i].paid_booster] = 1; return o2; }
              return undefined;
            })() }});
        }
        let isPassPremium = false;
        if (wsUser) {
          if (!wsUser.free_season_start_ms) {
            db.prepare('UPDATE users SET free_season_start_ms = ? WHERE id = ?').run(SEASON_START_MS, wsUser.id);
            wsUser.free_season_start_ms = SEASON_START_MS;
          }
          if (wsUser.free_season_start_ms === SEASON_START_MS) {
            isPassPremium = true;
          } else {
            const purchased = db.prepare('SELECT 1 FROM pass_purchases WHERE user_id = ? AND season_start_ms = ?').get(wsUser.id, SEASON_START_MS);
            isPassPremium = Boolean(purchased);
          }
        }
        const passInfoResponse = {
          type: 'pass_info',
          packet: ws.packetCounter++,
          state: 'running',
          pass_premium: isPassPremium,
          score: userPassScore,
          level: currentLevel,
          start_ms: Math.floor(SEASON_START_MS / 1000),
          finish_ms: Math.floor((SEASON_START_MS + 35 * dayMs2) / 1000),
          levels: passLevels,
          chest: { claimed: false, gold: 0, gold_max: 100, next_gold_score: 5000, overscore2gold: 50 }
        };
        ws.send(encodeMessage(passInfoResponse));
        console.log('WS SENT: pass_info response - level: ' + currentLevel);
      } else if (msg.type === 'pass_claim_level_reward') {
        if (wsUser) {
          const level = msg.level || 0;
          const line = msg.line || 'free';
          const REFERENCE_EPOCH_MS2 = new Date('2026-08-03T02:00:00Z').getTime();
          const seasonLengthMs2 = 35 * 24 * 60 * 60 * 1000;
          const seasonIdx2 = Math.floor((Date.now() - REFERENCE_EPOCH_MS2) / seasonLengthMs2);
          const computedSeasonStart2 = REFERENCE_EPOCH_MS2 + seasonIdx2 * seasonLengthMs2;
          const savedSeasonStart2 = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('season_start_ms');
          const seasonStart2 = savedSeasonStart2 ? Number(savedSeasonStart2.value) : computedSeasonStart2;const alreadyClaimed = db.prepare('SELECT 1 FROM pass_claims WHERE user_id = ? AND level = ? AND line = ? AND season_start_ms = ?').get(wsUser.id, level, line, seasonStart2);
          let gold = 0;
          if (!alreadyClaimed) {
            const rewardRow = db.prepare('SELECT * FROM pass_level_rewards WHERE level = ?').get(level);
            gold = rewardRow ? (line === 'paid' ? rewardRow.paid_gold : rewardRow.free_gold) : (line === 'paid' ? (10 + level * 5) * 2 : 10 + level * 5);
            db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(gold, wsUser.id);
            db.prepare('INSERT INTO pass_claims (user_id, level, line, season_start_ms) VALUES (?, ?, ?, ?)').run(wsUser.id, level, line, seasonStart2);
            console.log('WS: mukafat verildi - ' + wsUser.username + ' level=' + level + ' line=' + line + ' gold=' + gold);
          } else {
            console.log('WS: mukafat artiq alinib - ' + wsUser.username + ' level=' + level);
          }
          const rewardGold = alreadyClaimed ? 0 : gold;
          const claimResponse = {
            type: 'pass_claim_level_reward',
            packet: ws.packetCounter++,
            level: level,
            line: line,
            reward: { gold: rewardGold }
          };
          ws.send(encodeMessage(claimResponse));
        }} else if (msg.type === 'get_friend_games') {
        const fellowsList = [];
        if (wsUser) {
          const fellowRows = db.prepare('SELECT fellow_id FROM played_together WHERE user_id = ? ORDER BY last_played_at DESC LIMIT 20').all(wsUser.id);
          fellowRows.forEach(function(row) {
            const fellowWs = userIdToWs.get(row.fellow_id);
            if (fellowWs && fellowWs.gameRoom) {
              const fellowUser = db.prepare('SELECT * FROM users WHERE id = ?').get(row.fellow_id);
              if (fellowUser) {
                let menCount = 0, womenCount = 0;
                fellowWs.gameRoom.players.forEach(function(p) { if (p.male) menCount++; else womenCount++; });
                fellowsList.push({
                  user: { id: String(fellowUser.id), name: fellowUser.display_name || fellowUser.username, photo_url: fellowUser.avatar_data ? ('/api/avatar/' + fellowUser.id) : '' },
                  game_id: fellowWs.gameRoom.gameId,
                  men: menCount,
                  women: womenCount
                });
              }
            }
          });
        }
        const historyList = [];
        if (wsUser) {
          const visitedRows = db.prepare('SELECT room_id FROM visited_rooms WHERE user_id = ? ORDER BY last_visited_at DESC LIMIT 10').all(wsUser.id);
          visitedRows.forEach(function(row) {
            if (ws.gameRoom && ws.gameRoom.gameId === row.room_id) return;
            const histRoom = rooms.get(row.room_id);
            let men = 0, women = 0;
            if (histRoom) {
              histRoom.players.forEach(function(p) { if (p.male) men++; else women++; });
            }
            historyList.push({ game_id: row.room_id, men, women, bottle: histRoom ? (histRoom.bottleType || 'vipbottle') : 'vipbottle' });
          });
        }
        const friendGamesResponse = {
          type: 'friend_games',
          packet: ws.packetCounter++,
          friends: [],
          fellows: fellowsList,
          games_history: historyList
        };
        ws.send(encodeMessage(friendGamesResponse));
        console.log('WS SENT: friend_games response - fellows sayi: ' + fellowsList.length);} else if (msg.type === 'goto_random') {
        console.log('WS: goto_random alindi');
        const oldRoomForRandom = ws.gameRoom;
        if (ws.gameRoom) {
          removePlayerFromRoom(ws.gameRoom, ws);
        }
        let newRoom = null;
        for (const r of rooms.values()) {
          if (r !== oldRoomForRandom && r.players.size < MAX_SEATS) { newRoom = r; break; }
        }
        if (!newRoom) newRoom = createRoom();
        const newSeat = getNextSeatInRoom(newRoom);
        let rejoinedPlayer = ws.gamePlayer ? Object.assign({}, ws.gamePlayer, { seat: newSeat }) : null;
        if (rejoinedPlayer) {
          delete rejoinedPlayer.ava_gift;
          delete rejoinedPlayer.ava_gift_random;
          delete rejoinedPlayer.hat;
          delete rejoinedPlayer.drink;
          if (rejoinedPlayer.id && newRoom.stickedGifts.has(rejoinedPlayer.id)) {
            const freshGifts = newRoom.stickedGifts.get(rejoinedPlayer.id);
            if (freshGifts.ava_gift) { rejoinedPlayer.ava_gift = freshGifts.ava_gift; rejoinedPlayer.ava_gift_random = freshGifts.ava_gift_random; }
            if (freshGifts.hat) rejoinedPlayer.hat = freshGifts.hat;
            if (freshGifts.drink) rejoinedPlayer.drink = freshGifts.drink;
          }
        }
        if (rejoinedPlayer) {
          const others = [];
          newRoom.players.forEach(p => others.push(p));
          if (wsUser && isKickedFromRoom(wsUser.id, newRoom.gameId)) {
            ws.send(encodeMessage({ type: 'kickout_info', kickout_ts: wsUser.kicked_until, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
            return;
          }
          newRoom.players.set(ws, rejoinedPlayer);
          ws.gamePlayer = rejoinedPlayer;
          ws.gameRoom = newRoom;
        if (rejoinedPlayer && rejoinedPlayer.id) { try { db.prepare('INSERT INTO visited_rooms (user_id, room_id, last_visited_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(user_id, room_id) DO UPDATE SET last_visited_at = excluded.last_visited_at').run(rejoinedPlayer && rejoinedPlayer.id, newRoom.gameId); } catch(e) {} }
          const reGameEnter = {
            type: 'game_enter',
            packet: ws.packetCounter++,
            game_id: newRoom.gameId,
            bottle_type: newRoom.bottleType || 'vipbottle',
            participants: [rejoinedPlayer, ...others]
          };
          ws.send(encodeMessage(reGameEnter));
          if (newRoom.chatHistory && newRoom.chatHistory.length > 0) {
            const cleanHistorySwitch = newRoom.chatHistory.map(function(histMsg) {
              const freshMsg = Object.assign({}, histMsg);
              delete freshMsg.packet;
              return freshMsg;
            });
            ws.send(encodeMessage({ type: 'game_chat_history', messages: cleanHistorySwitch, packet: ws.packetCounter = (ws.packetCounter || 1000) + 1 }));
          }
          console.log('WS: yeni masa - ' + newRoom.gameId + ' oyuncu sayi: ' + newRoom.players.size);
          broadcastToRoom(newRoom, ws, { type: 'game_join', user: rejoinedPlayer });
          startBottleTurn(newRoom);
          if (newRoom.currentSong && (Date.now() - newRoom.currentSong.start_timestamp) < ((newRoom.currentSong.duration || 240) * 1000)) {
            const songReplay2 = Object.assign({}, newRoom.currentSong);
            const realElapsedSec2 = (Date.now() - songReplay2.start_timestamp) / 1000;
            const safeDuration2 = (songReplay2.duration || 999) - 5;
            if (realElapsedSec2 > safeDuration2) {
              songReplay2.start_timestamp = Date.now() - (safeDuration2 * 1000);
            }
            songReplay2.packet = ws.packetCounter++;
            ws.send(encodeMessage(songReplay2));
          }
        }
      } else if (msg.type === 'goto_specific_room' || msg.type === 'goto_history' || msg.type === 'goto_view_table') {
        if (msg.type !== 'goto_specific_room') msg.room_id = msg.game_id;
        console.log('WS: goto_specific_room alindi - target=' + msg.room_id);
        const targetRoomId = Number(msg.room_id);
        let targetRoom = rooms.get(targetRoomId);
        if (!targetRoom && targetRoomId > 0) {
          targetRoom = { gameId: targetRoomId, players: new Map(), stickedGifts: new Map() };
          rooms.set(targetRoomId, targetRoom);
          if (targetRoomId >= nextGameId) nextGameId = targetRoomId + 1;
          console.log('WS: yeni masa avtomatik yaradildi - masa=' + targetRoomId);
        }
        if (targetRoom && targetRoom.players.size < MAX_SEATS) {
          if (ws.gameRoom) {
            removePlayerFromRoom(ws.gameRoom, ws);
          }
          const destSeatX = getNextSeatInRoom(targetRoom);
          let rejoinedPlayerX = ws.gamePlayer ? Object.assign({}, ws.gamePlayer, { seat: destSeatX }) : null;
          if (rejoinedPlayerX) {
            delete rejoinedPlayerX.ava_gift;
            delete rejoinedPlayerX.ava_gift_random;
            delete rejoinedPlayerX.hat;
            delete rejoinedPlayerX.drink;
            if (rejoinedPlayerX.id && targetRoom.stickedGifts.has(rejoinedPlayerX.id)) {
              const freshGiftsX = targetRoom.stickedGifts.get(rejoinedPlayerX.id);
              if (freshGiftsX.ava_gift) { rejoinedPlayerX.ava_gift = freshGiftsX.ava_gift; rejoinedPlayerX.ava_gift_random = freshGiftsX.ava_gift_random; }
              if (freshGiftsX.hat) rejoinedPlayerX.hat = freshGiftsX.hat;
              if (freshGiftsX.drink) rejoinedPlayerX.drink = freshGiftsX.drink;
            }
            const othersX = [];
            targetRoom.players.forEach(p => othersX.push(p));
            if (wsUser && isKickedFromRoom(wsUser.id, targetRoom.gameId)) {
              ws.send(encodeMessage({ type: 'kickout_info', kickout_ts: wsUser.kicked_until, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
              return;
            }
            targetRoom.players.set(ws, rejoinedPlayerX);
            ws.gamePlayer = rejoinedPlayerX;
            ws.gameRoom = targetRoom;
        if (rejoinedPlayerX && rejoinedPlayerX.id) { try { db.prepare('INSERT INTO visited_rooms (user_id, room_id, last_visited_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(user_id, room_id) DO UPDATE SET last_visited_at = excluded.last_visited_at').run(rejoinedPlayerX && rejoinedPlayerX.id, targetRoom.gameId); } catch(e) {} }
            const reGameEnterX = {
              type: 'game_enter',
              packet: ws.packetCounter++,
              game_id: targetRoom.gameId,
              bottle_type: targetRoom.bottleType || 'vipbottle',
              participants: [rejoinedPlayerX, ...othersX]
            };
            ws.send(encodeMessage(reGameEnterX));
            if (targetRoom.chatHistory && targetRoom.chatHistory.length > 0) {
              const cleanHistoryX = targetRoom.chatHistory.map(function(histMsg) {
                const freshMsg = Object.assign({}, histMsg);
                delete freshMsg.packet;
                return freshMsg;
              });
              ws.send(encodeMessage({ type: 'game_chat_history', messages: cleanHistoryX, packet: ws.packetCounter = (ws.packetCounter || 1000) + 1 }));
            }
            console.log('WS: konkret masaya qowuldu - masa=' + targetRoom.gameId);
            broadcastToRoom(targetRoom, ws, { type: 'game_join', user: rejoinedPlayerX });
            if (targetRoom.currentSong && (Date.now() - targetRoom.currentSong.start_timestamp) < ((targetRoom.currentSong.duration || 240) * 1000)) {
              const songReplayX = Object.assign({}, targetRoom.currentSong);
              const realElapsedSecX = (Date.now() - songReplayX.start_timestamp) / 1000;
              const safeDurationX = (songReplayX.duration || 999) - 5;
              if (realElapsedSecX > safeDurationX) {
                songReplayX.start_timestamp = Date.now() - (safeDurationX * 1000);
              }
              setTimeout(() => {
                if (ws.readyState !== 1) return;
                if (!ws.packetCounter) ws.packetCounter = 1000;
                songReplayX.packet = ws.packetCounter++;
                ws.send(encodeMessage(songReplayX));
              }, 1500);
            }
            startBottleTurn(targetRoom);
          }
        } else {
          ws.send(encodeMessage({ type: 'room_join_error', reason: targetRoom ? 'room_full' : 'room_not_found', packet: ws.packetCounter = (ws.packetCounter || 1000) + 1 }));
        }
      } else if (msg.type === 'start_live') {
    if (!wsUser) { ws.send(encodeMessage({ type: 'live_error', reason: 'not_logged_in', packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); return; }
    const roomId = normalizeLiveRoomId(msg.room_id);
    if (roomId && getLiveRoomStream(roomId)) {
      ws.send(encodeMessage({ type: 'live_error', reason: 'room_busy', room_id: roomId, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
      return;
    }
    const streamId = nextStreamId++;
    const hostSeat = { ws, userId: wsUser.id, name: wsUser.display_name || wsUser.username, photo: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '', hasCamera: Boolean(msg.has_camera), photoData: msg.photo_url || (typeof msg.photo_data === 'string' && msg.photo_data.length < 4096 ? msg.photo_data : null), livePhotoUrl: typeof msg.photo_url === 'string' ? msg.photo_url : '' };
    const stream = {
      id: streamId,
      hostId: wsUser.id,
      seats: new Map([[wsUser.id, hostSeat]]),
      viewers: new Map(),
      likes: 0,
      chatHistory: [],
      giftSupporters: new Map(),
      startedAt: Date.now(),
      mode: ['camera', 'photo', 'screen', 'game'].includes(msg.mode) ? msg.mode : 'camera',
      roomId,
      blockedUsers: new Set(),
      moderators: new Set(),
      pk: null
    };
    liveStreamsMap.set(streamId, stream);
    ws.liveStreamId = streamId;
    ws.send(encodeMessage({ type: 'live_started', stream_id: streamId, host_id: String(wsUser.id), host_name: hostSeat.name,
      host_photo: hostSeat.photo, photo_url: hostSeat.livePhotoUrl || hostSeat.photoData || '', room_id: roomId, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
    console.log('WS: canli yayim baslandi - ' + hostSeat.name + ' id=' + streamId);
} else if (msg.type === 'stop_live') {
    const streamId = ws.liveStreamId;
    const stream = streamId ? liveStreamsMap.get(streamId) : null;
    if (stream && wsUser && stream.hostId === wsUser.id) {
      cancelPkForStream(streamId, 'host_ended_live');
      const endMsg = { type: 'live_ended', stream_id: streamId };
      stream.seats.forEach(seat => { if (seat.userId !== wsUser.id) try { seat.ws.send(encodeMessage(Object.assign({}, endMsg, { packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 }))); } catch(e) {} });
      stream.viewers.forEach((uid, vws) => { try { vws.send(encodeMessage(Object.assign({}, endMsg, { packet: vws.packetCounter=(vws.packetCounter||1000)+1 }))); } catch(e) {} });
      liveStreamsMap.delete(streamId);
      console.log('WS: canli yayim bitdi - id=' + streamId);
    }
    ws.liveStreamId = null;
} else if (msg.type === 'get_live_list') {
    const nowGll = Date.now();
    if (ws.lastGetLiveList && nowGll - ws.lastGetLiveList < 2000) return;
    ws.lastGetLiveList = nowGll;
    const list = [];
    liveStreamsMap.forEach((s) => {
      const host = s.seats.get(s.hostId);
      list.push({ id: s.id, name: host ? host.name : '', photo: host ? (host.livePhotoUrl || host.photo) : '', has_camera: host ? host.hasCamera : false, viewer_count: s.viewers.size, seat_count: s.seats.size, likes: s.likes, mode: s.mode, room_id: s.roomId || '', pk_active: Boolean(s.pk) });
    });
    ws.send(encodeMessage({ type: 'live_list', streams: list, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
} else if (msg.type === 'get_broadcaster_leaderboard') {
    const period = ['daily','weekly','monthly'].includes(msg.period) ? msg.period : 'daily';
    ws.send(encodeMessage({ type:'broadcaster_leaderboard', period, list:broadcasterLeaderboard(period),
      packet:ws.packetCounter=(ws.packetCounter||1000)+1 }));
} else if (msg.type === 'get_live_viewers') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser || stream.hostId !== wsUser.id) return;
    const viewers = [];
    stream.viewers.forEach((uid) => {
      const numericId = Number(uid);
      if (!Number.isFinite(numericId)) return;
      const user = db.prepare('SELECT id, username, display_name, avatar_data FROM users WHERE id = ?').get(numericId);
      if (!user) return;
      viewers.push({ user_id: String(user.id), name: user.display_name || user.username,
        photo: user.avatar_data ? ('/api/avatar/' + user.id) : '' });
    });
    ws.send(encodeMessage({ type: 'live_viewers_list', viewers, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
} else if (msg.type === 'request_live_seat') {
    const stream=liveStreamsMap.get(Number(msg.stream_id));
    if(!stream||!wsUser||!stream.viewers.has(ws))return;
    const now=Date.now();if(ws.lastSeatRequestAt&&now-ws.lastSeatRequestAt<15000){liveSend(ws,{type:'live_error',reason:'seat_request_slow_down'});return;}ws.lastSeatRequestAt=now;
    const host=stream.seats.get(stream.hostId);if(!host)return;
    liveSend(host.ws,{type:'live_seat_request',stream_id:stream.id,user_id:String(wsUser.id),name:wsUser.display_name||wsUser.username,photo:wsUser.avatar_data?('/api/avatar/'+wsUser.id):''});
    liveSend(ws,{type:'live_seat_request_sent'});
} else if (msg.type === 'decline_live_seat_request') {
    const stream=liveStreamsMap.get(Number(msg.stream_id));
    if(!stream||!wsUser||stream.hostId!==wsUser.id)return;
    const targetWs=userIdToWs.get(Number(msg.target_user_id));if(targetWs)liveSend(targetWs,{type:'live_seat_request_declined',stream_id:stream.id});
} else if (msg.type === 'join_live') {
    const requestedStreamId = Number(msg.stream_id);
    const requestedRoomId = normalizeLiveRoomId(msg.room_id);
    const stream = Number.isFinite(requestedStreamId) && requestedStreamId > 0
      ? liveStreamsMap.get(requestedStreamId)
      : (requestedRoomId ? getLiveRoomStream(requestedRoomId) : null);
    if (!stream) { ws.send(encodeMessage({ type: 'live_error', reason: 'not_found', room_id: requestedRoomId, packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); return; }
    if (wsUser && stream.blockedUsers && stream.blockedUsers.has(wsUser.id)) { ws.send(encodeMessage({ type: 'live_error', reason: 'blocked', packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); return; }
    const viewerId = wsUser ? wsUser.id : ('guest_' + Math.random().toString(36).slice(2));
    stream.viewers.set(ws, viewerId);
    ws.watchingStreamId = stream.id;
    ws.viewerIdInStream = viewerId;
    const seatsInfo = [];
    stream.seats.forEach(seat => seatsInfo.push({ user_id: String(seat.userId), name: seat.name, photo: seat.photo, has_camera: seat.hasCamera, photo_data: seat.livePhotoUrl || seat.photoData }));
    ws.send(encodeMessage({
      type: 'live_joined', stream_id: stream.id, room_id: stream.roomId || '', seats: seatsInfo, mode: stream.mode, photo_url: (stream.seats.get(stream.hostId)||{}).livePhotoUrl || '', my_viewer_id: String(viewerId), likes: stream.likes, viewer_count: stream.viewers.size,
      chat_history: stream.chatHistory.slice(-30), gift_leaderboard: Array.from(stream.giftSupporters.values()).sort((a,b)=>b.points-a.points).slice(0,50),
      packet: ws.packetCounter=(ws.packetCounter||1000)+1
    }));
    const snapshot = pkSnapshot(stream);
    if (snapshot) {
      liveSend(ws, snapshot);
      const other = liveStreamsMap.get(stream.pk.otherStreamId);
      const host = other && other.seats.get(other.hostId);
      if (host) liveSend(host.ws, {type:'live_new_viewer',viewer_id:String(viewerId)});
    }
    const joinedName = wsUser ? (wsUser.display_name || wsUser.username) : 'Qonaq';
    const joinedPhoto = wsUser && wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '';
    const joinedPayload = { type: 'live_user_joined', user_id: String(viewerId), name: joinedName, photo: joinedPhoto,
      viewer_count: stream.viewers.size };
    stream.seats.forEach(seat => {
      try { seat.ws.send(encodeMessage({ type: 'live_new_viewer', viewer_id: String(viewerId), viewer_count: stream.viewers.size, packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 })); } catch(e) {}
      try { seat.ws.send(encodeMessage(Object.assign({}, joinedPayload, { packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 }))); } catch(e) {}
    });
    stream.viewers.forEach((uid, vws) => {
      try { vws.send(encodeMessage(Object.assign({}, joinedPayload, { packet: vws.packetCounter=(vws.packetCounter||1000)+1 }))); } catch(e) {}
    });
    console.log('WS: canli yayima qosuldu - stream=' + stream.id + ' baxan sayi=' + stream.viewers.size);
} else if (msg.type === 'leave_live') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (stream && stream.viewers.has(ws)) {
      const viewerId = stream.viewers.get(ws);
      stream.viewers.delete(ws);
      stream.seats.forEach(seat => {
        try { seat.ws.send(encodeMessage({ type: 'live_viewer_left', viewer_id: String(viewerId), viewer_count: stream.viewers.size, packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 })); } catch(e) {}
      });
    }
    ws.watchingStreamId = null;
} else if (msg.type === 'invite_to_live') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser || stream.hostId !== wsUser.id) return;
    if (stream.seats.size >= 10) { ws.send(encodeMessage({ type: 'live_error', reason: 'seats_full', packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); return; }
    const targetWs = userIdToWs.get(Number(msg.target_user_id));
    if (!targetWs) { ws.send(encodeMessage({ type: 'live_error', reason: 'user_offline', packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); return; }
    const hostSeat = stream.seats.get(stream.hostId);
    targetWs.send(encodeMessage({ type: 'live_invite', stream_id: stream.id, host_name: hostSeat.name, host_photo: hostSeat.photo, packet: targetWs.packetCounter=(targetWs.packetCounter||1000)+1 }));
    console.log('WS: canli yayima devet gonderildi - stream=' + stream.id + ' target=' + msg.target_user_id);
} else if (msg.type === 'respond_to_invite') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser) return;
    if (stream.blockedUsers && stream.blockedUsers.has(wsUser.id)) return;
    if (!msg.accept) {
      const hostSeat0 = stream.seats.get(stream.hostId);
      if (hostSeat0) try { hostSeat0.ws.send(encodeMessage({ type: 'live_invite_declined', user_name: wsUser.display_name || wsUser.username, packet: hostSeat0.ws.packetCounter=(hostSeat0.ws.packetCounter||1000)+1 })); } catch(e) {}
      return;
    }
    if (stream.seats.size >= 10) { ws.send(encodeMessage({ type: 'live_error', reason: 'seats_full', packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); return; }
    const newSeat = { ws, userId: wsUser.id, name: wsUser.display_name || wsUser.username, photo: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '', hasCamera: Boolean(msg.has_camera), photoData: msg.photo_url || (typeof msg.photo_data === 'string' && msg.photo_data.length < 4096 ? msg.photo_data : null), livePhotoUrl: typeof msg.photo_url === 'string' ? msg.photo_url : '' };
    stream.viewers.delete(ws);
    ws.watchingStreamId = null;
    stream.seats.set(wsUser.id, newSeat);
    ws.liveStreamId = stream.id;
    const existingSeats = [];
    stream.seats.forEach(s => { if (s.userId !== wsUser.id) existingSeats.push({ user_id: String(s.userId), name: s.name, photo: s.photo, has_camera: s.hasCamera, photo_data: s.photoData }); });
    const existingViewerIds = [];
    stream.viewers.forEach((uid) => existingViewerIds.push(String(uid)));
    ws.send(encodeMessage({ type: 'live_seat_joined_self', stream_id: stream.id, existing_seats: existingSeats, existing_viewer_ids: existingViewerIds, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
    stream.seats.forEach(seat => {
      if (seat.userId === wsUser.id) return;
      try { seat.ws.send(encodeMessage({ type: 'live_new_seat', user_id: String(wsUser.id), name: newSeat.name, photo: newSeat.photo, has_camera: newSeat.hasCamera, photo_data: newSeat.livePhotoUrl || newSeat.photoData, photo_url: newSeat.livePhotoUrl || '', packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 })); } catch(e) {}
    });
    stream.viewers.forEach((uid, vws) => {
      try { vws.send(encodeMessage({ type: 'live_new_seat', user_id: String(wsUser.id), name: newSeat.name, photo: newSeat.photo, has_camera: newSeat.hasCamera, photo_data: newSeat.livePhotoUrl || newSeat.photoData, photo_url: newSeat.livePhotoUrl || '', packet: vws.packetCounter=(vws.packetCounter||1000)+1 })); } catch(e) {}
    });
    console.log('WS: yeni qonaq canli yayima qosuldu - stream=' + stream.id + ' user=' + wsUser.username);
} else if (msg.type === 'leave_seat') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser || !stream.seats.has(wsUser.id)) return;
    if (wsUser.id === stream.hostId) return;
    stream.seats.delete(wsUser.id);
    ws.liveStreamId = null;
    stream.seats.forEach(seat => {
      try { seat.ws.send(encodeMessage({ type: 'live_seat_left', user_id: String(wsUser.id), packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 })); } catch(e) {}
    });
    stream.viewers.forEach((uid, vws) => {
      try { vws.send(encodeMessage({ type: 'live_seat_left', user_id: String(wsUser.id), packet: vws.packetCounter=(vws.packetCounter||1000)+1 })); } catch(e) {}
    });
} else if (msg.type === 'webrtc_offer' || msg.type === 'webrtc_answer' || msg.type === 'webrtc_ice') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream) return;
    const senderIsSeat = [...stream.seats.values()].some(seat => seat.ws === ws);
    if (!senderIsSeat && !stream.viewers.has(ws)) return;
    let targetWs = null;
    const targetIdStr = String(msg.target_id);
    stream.seats.forEach(seat => { if (String(seat.userId) === targetIdStr) targetWs = seat.ws; });
    if (!targetWs && stream.pk && stream.pk.active) {
      const oppStream = liveStreamsMap.get(stream.pk.otherStreamId);
      if (oppStream) {
        oppStream.seats.forEach(seat => { if (String(seat.userId) === targetIdStr) targetWs = seat.ws; });
      }
    }
    if (!targetWs) {
      stream.viewers.forEach((uid, vws) => { if (String(uid) === targetIdStr) targetWs = vws; });
    }
    if (!targetWs && stream.pk) {
      const other = liveStreamsMap.get(stream.pk.otherStreamId);
      if (other) other.viewers.forEach((uid, client) => { if (String(uid) === targetIdStr) targetWs = client; });
    }
    if (!targetWs) return;
    const fromId = wsUser ? String(wsUser.id) : (ws.viewerIdInStream ? String(ws.viewerIdInStream) : 'guest');
    if (msg.type === 'webrtc_offer') {
      targetWs.send(encodeMessage({ type: 'webrtc_offer', sdp: msg.sdp, from_id: fromId, packet: targetWs.packetCounter=(targetWs.packetCounter||1000)+1 }));
    } else if (msg.type === 'webrtc_answer') {
      targetWs.send(encodeMessage({ type: 'webrtc_answer', sdp: msg.sdp, from_id: fromId, packet: targetWs.packetCounter=(targetWs.packetCounter||1000)+1 }));
    } else if (msg.type === 'webrtc_ice') {
      targetWs.send(encodeMessage({ type: 'webrtc_ice', candidate: msg.candidate, from_id: fromId, packet: targetWs.packetCounter=(targetWs.packetCounter||1000)+1 }));
    }
} else if (msg.type === 'live_chat') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !msg.text || !msg.text.trim()) return;
    const levelRow=wsUser?db.prepare('SELECT gift_level_score FROM users WHERE id = ?').get(wsUser.id):null;
    const messageLevel=liveGiftLevel(levelRow&&levelRow.gift_level_score);
    const chatMsg = { name: wsUser ? (wsUser.display_name || wsUser.username) : 'Qonaq',
      photo: wsUser && wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '', level:messageLevel,
      badge:liveLevelBadge(messageLevel),text:msg.text.trim().slice(0,200),ts:Date.now() };
    stream.chatHistory.push(chatMsg);
    if (stream.chatHistory.length > 50) stream.chatHistory.shift();
    const payload = { type:'live_chat',name:chatMsg.name,photo:chatMsg.photo,level:chatMsg.level,badge:chatMsg.badge,text:chatMsg.text };
    stream.seats.forEach(seat => { try { seat.ws.send(encodeMessage(Object.assign({}, payload, { packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 }))); } catch(e) {} });
    stream.viewers.forEach((uid, vws) => { try { vws.send(encodeMessage(Object.assign({}, payload, { packet: vws.packetCounter=(vws.packetCounter||1000)+1 }))); } catch(e) {} });
} else if (msg.type === 'live_like') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream) return;
    stream.likes++;
    const payload = { type: 'live_likes', likes: stream.likes };
    stream.seats.forEach(seat => { try { seat.ws.send(encodeMessage(Object.assign({}, payload, { packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 }))); } catch(e) {} });
    stream.viewers.forEach((uid, vws) => { try { vws.send(encodeMessage(Object.assign({}, payload, { packet: vws.packetCounter=(vws.packetCounter||1000)+1 }))); } catch(e) {} });
} else if (msg.type === 'toggle_mic') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser || !stream.seats.has(wsUser.id)) return;
    const seat = stream.seats.get(wsUser.id);
    seat.muted = Boolean(msg.muted);
    const payload = { type: 'live_mic_state', user_id: String(wsUser.id), muted: seat.muted };
    stream.seats.forEach(s => { if (s.userId !== wsUser.id) try { s.ws.send(encodeMessage(Object.assign({}, payload, { packet: s.ws.packetCounter=(s.ws.packetCounter||1000)+1 }))); } catch(e) {} });
    stream.viewers.forEach((uid, vws) => { try { vws.send(encodeMessage(Object.assign({}, payload, { packet: vws.packetCounter=(vws.packetCounter||1000)+1 }))); } catch(e) {} });
} else if (msg.type === 'toggle_camera') {
    const stream=liveStreamsMap.get(Number(msg.stream_id));
    if(!stream||!wsUser||!stream.seats.has(wsUser.id))return;
    const seat=stream.seats.get(wsUser.id);seat.cameraOff=Boolean(msg.off);
    const payload={type:'live_camera_state',user_id:String(wsUser.id),off:seat.cameraOff};
    stream.seats.forEach(s=>{if(s.userId!==wsUser.id)liveSend(s.ws,payload);});
    stream.viewers.forEach((uid,vws)=>liveSend(vws,payload));
} else if (msg.type === 'block_user') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser || stream.hostId !== wsUser.id) return;
    if (!stream.blockedUsers) stream.blockedUsers = new Set();
    const targetId = Number(msg.target_user_id);
    stream.blockedUsers.add(targetId);
    if (stream.seats.has(targetId)) {
      const seat = stream.seats.get(targetId);
      stream.seats.delete(targetId);
      try { seat.ws.send(encodeMessage({ type: 'live_blocked', stream_id: stream.id, packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 })); } catch(e) {}
      stream.seats.forEach(s => { try { s.ws.send(encodeMessage({ type: 'live_seat_left', user_id: String(targetId), packet: s.ws.packetCounter=(s.ws.packetCounter||1000)+1 })); } catch(e) {} });
    }
    stream.viewers.forEach((uid, vws) => {
      if (Number(uid) === targetId) {
        stream.viewers.delete(vws);
        try { vws.send(encodeMessage({ type: 'live_blocked', stream_id: stream.id, packet: vws.packetCounter=(vws.packetCounter||1000)+1 })); } catch(e) {}
      }
    });
    console.log('WS: istifadeci canli yayimdan blok edildi - stream=' + stream.id + ' target=' + targetId);
} else if (msg.type === 'unblock_user') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser || stream.hostId !== wsUser.id) return;
    if (stream.blockedUsers) stream.blockedUsers.delete(Number(msg.target_user_id));
} else if (msg.type === 'make_moderator') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser || stream.hostId !== wsUser.id) return;
    if (!stream.moderators) stream.moderators = new Set();
    stream.moderators.add(Number(msg.target_user_id));
    const targetWs = userIdToWs.get(Number(msg.target_user_id));
    if (targetWs) try { targetWs.send(encodeMessage({ type: 'live_made_moderator', stream_id: stream.id, packet: targetWs.packetCounter=(targetWs.packetCounter||1000)+1 })); } catch(e) {}
    console.log('WS: moderator tayin edildi - stream=' + stream.id + ' target=' + msg.target_user_id);
} else if (msg.type === 'remove_moderator') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser || stream.hostId !== wsUser.id) return;
    if (stream.moderators) stream.moderators.delete(Number(msg.target_user_id));
} else if (msg.type === 'kick_user') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser) return;
    const isAllowed = stream.hostId === wsUser.id || (stream.moderators && stream.moderators.has(wsUser.id));
    if (!isAllowed) return;
    const targetId = Number(msg.target_user_id);
    if (targetId === stream.hostId) return;
    if (stream.seats.has(targetId)) {
      const seat = stream.seats.get(targetId);
      stream.seats.delete(targetId);
      try { seat.ws.send(encodeMessage({ type: 'live_kicked', stream_id: stream.id, packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 })); } catch(e) {}
      stream.seats.forEach(s => { try { s.ws.send(encodeMessage({ type: 'live_seat_left', user_id: String(targetId), packet: s.ws.packetCounter=(s.ws.packetCounter||1000)+1 })); } catch(e) {} });
      stream.viewers.forEach((uid, vws) => { try { vws.send(encodeMessage({ type: 'live_seat_left', user_id: String(targetId), packet: vws.packetCounter=(vws.packetCounter||1000)+1 })); } catch(e) {} });
    } else {
      stream.viewers.forEach((uid, vws) => {
        if (Number(uid) === targetId) {
          stream.viewers.delete(vws);
          try { vws.send(encodeMessage({ type: 'live_kicked', stream_id: stream.id, packet: vws.packetCounter=(vws.packetCounter||1000)+1 })); } catch(e) {}
        }
      });
    }
    console.log('WS: istifadeci canli yayimdan qovuldu - stream=' + stream.id + ' target=' + targetId);
} else if (msg.type === 'mute_user') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser) return;
    const isAllowed = stream.hostId === wsUser.id || (stream.moderators && stream.moderators.has(wsUser.id));
    if (!isAllowed) return;
    const targetId = Number(msg.target_user_id);
    const seat = stream.seats.get(targetId);
    if (!seat) return;
    seat.muted = true;
    try { seat.ws.send(encodeMessage({ type: 'live_force_muted', stream_id: stream.id, packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 })); } catch(e) {}
    const payload = { type: 'live_mic_state', user_id: String(targetId), muted: true };
    stream.seats.forEach(s => { if (s.userId !== targetId) try { s.ws.send(encodeMessage(Object.assign({}, payload, { packet: s.ws.packetCounter=(s.ws.packetCounter||1000)+1 }))); } catch(e) {} });
    stream.viewers.forEach((uid, vws) => { try { vws.send(encodeMessage(Object.assign({}, payload, { packet: vws.packetCounter=(vws.packetCounter||1000)+1 }))); } catch(e) {} });
    console.log('WS: istifadeci susduruldu - stream=' + stream.id + ' target=' + targetId);
} else if (msg.type === 'live_send_gift') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser) return;
    const gift = liveGiftCatalogMap.get(String(msg.gift_id));
    if (!gift) {
      ws.send(encodeMessage({ type: 'live_error', reason: 'invalid_gift_id', packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
      return;
    }
    const giftPrice = Math.max(1, Number(gift.diamond_count) || 1);
    const targetId = Number(msg.target_user_id) || stream.hostId;
    let targetSeat = stream.seats.get(targetId) || null;
    if (!targetSeat && stream.pk && stream.pk.active) {
      const opponentStream = liveStreamsMap.get(stream.pk.otherStreamId);
      if (opponentStream) targetSeat = opponentStream.seats.get(targetId) || null;
    }
    if (!targetSeat) { liveSend(ws,{type:'live_error',reason:'invalid_gift_target'}); return; }
    if (targetId === wsUser.id) { liveSend(ws,{type:'live_error',reason:'cannot_gift_self'}); return; }
    const beforeGift=db.prepare('SELECT gift_level_score FROM users WHERE id = ?').get(wsUser.id);
    const oldLevel=liveGiftLevel(beforeGift&&beforeGift.gift_level_score);
    const charged = db.prepare('UPDATE users SET live_tokens = live_tokens - ?, gift_level_score = gift_level_score + ? WHERE id = ? AND live_tokens >= ?')
      .run(giftPrice, giftPrice, wsUser.id, giftPrice);
    if (!charged.changes) {
      ws.send(encodeMessage({ type: 'live_error', reason: 'insufficient_tokens', packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
      return;
    }
    const updatedTok = db.prepare('SELECT live_tokens, gift_level_score FROM users WHERE id = ?').get(wsUser.id);
    const senderLevel=liveGiftLevel(updatedTok.gift_level_score),senderBadge=liveLevelBadge(senderLevel);
    db.prepare('UPDATE users SET live_tokens = live_tokens + ? WHERE id = ?').run(giftPrice, targetId);
    recordBroadcasterGift(targetId, giftPrice);
    const targetBalance = db.prepare('SELECT live_tokens FROM users WHERE id = ?').get(targetId);
    if (targetBalance && targetSeat.ws) liveSend(targetSeat.ws,{type:'live_tokens_update',live_tokens:targetBalance.live_tokens});
    ws.send(encodeMessage({ type: 'live_tokens_update', live_tokens: updatedTok.live_tokens, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
    const giftEffectId = liveGiftEffectMap.get(String(msg.gift_id)) || null;
    if (giftEffectId) grantGiftMedia(stream, giftEffectId);
    const payload = { type: 'live_gift_received', gift_id: gift.id, gift_name: gift.name, gift_price: giftPrice, gift_image: gift.icon,
      effect_id: giftEffectId, has_animation: Boolean(giftEffectId),
      sender_name: wsUser.display_name || wsUser.username, sender_id: String(wsUser.id), sender_level:senderLevel,sender_badge:senderBadge,
      target_user_id: String(targetId), target_name: targetSeat.name };
    const supporterKey=String(wsUser.id),supporter=stream.giftSupporters.get(supporterKey)||{user_id:supporterKey,name:wsUser.display_name||wsUser.username,photo:wsUser.avatar_data?('/api/avatar/'+wsUser.id):'',points:0,level:senderLevel};
    supporter.points+=giftPrice;supporter.level=senderLevel;stream.giftSupporters.set(supporterKey,supporter);
    const giftLeaderboard=Array.from(stream.giftSupporters.values()).sort((a,b)=>b.points-a.points).slice(0,50);
    stream.seats.forEach(seat => { try { seat.ws.send(encodeMessage(Object.assign({}, payload, { packet: seat.ws.packetCounter=(seat.ws.packetCounter||1000)+1 }))); } catch(e) {} });
    stream.viewers.forEach((uid, vws) => { try { vws.send(encodeMessage(Object.assign({}, payload, { packet: vws.packetCounter=(vws.packetCounter||1000)+1 }))); } catch(e) {} });
    liveBroadcast(stream,{type:'live_gift_leaderboard',supporters:giftLeaderboard});
    for (const period of ['daily','weekly','monthly']) {
      const rankPayload={type:'broadcaster_leaderboard',period,list:broadcasterLeaderboard(period)};
      liveBroadcast(stream,rankPayload);
      if (stream.pk) { const other=liveStreamsMap.get(stream.pk.otherStreamId); if(other) liveBroadcast(other,rankPayload); }
    }
    if(senderLevel>oldLevel)liveBroadcast(stream,{type:'live_level_up',user_id:String(wsUser.id),name:wsUser.display_name||wsUser.username,from_level:oldLevel,level:senderLevel,badge:senderBadge});
    if (giftPrice >= LIVE_GLOBAL_GIFT_MIN) {
      const targetUser = Number(msg.target_user_id) ? db.prepare('SELECT username, display_name FROM users WHERE id = ?').get(Number(msg.target_user_id)) : null;
      const globalPayload = { type: 'live_global_gift', sender_name: wsUser.display_name || wsUser.username,sender_level:senderLevel,sender_badge:senderBadge,
        target_name: targetUser ? (targetUser.display_name || targetUser.username) : 'yayımçı', gift_name: gift.name,
        gift_image: gift.icon, gift_price: giftPrice };
      const notified = new Set();
      liveStreamsMap.forEach(activeStream => {
        activeStream.seats.forEach(seat => { if(!notified.has(seat.ws)){notified.add(seat.ws);liveSend(seat.ws,globalPayload);} });
        activeStream.viewers.forEach((uid,vws) => { if(!notified.has(vws)){notified.add(vws);liveSend(vws,globalPayload);} });
      });
    }
    if (stream.pk) {
      const session = pkSessions.get(stream.pk.id);
      if (session && session.phase === 'battle' && Date.now() < session.endsAt) {
        const targetId = Number(msg.target_user_id) || stream.hostId;
        if (targetId === session.hostA) session.scoreA += giftPrice;
        else if (targetId === session.hostB) session.scoreB += giftPrice;
        else return;
        const supporterId = String(wsUser.id);
        session.supporters[supporterId] = (session.supporters[supporterId] || 0) + giftPrice;
        pkBroadcast(session, { type: 'pk_score_update', phase: session.phase, score_a: session.scoreA,
          score_b: session.scoreB, supporter_id: supporterId, supporter_name: wsUser.display_name || wsUser.username,
          contribution: session.supporters[supporterId] });
      }
    }
    console.log('WS: canli hediyye gonderildi - stream=' + stream.id + ' gift=' + msg.gift_id + ' price=' + giftPrice);
} else if (msg.type === 'start_pk') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser || stream.hostId !== wsUser.id) return;
    const oppStream = liveStreamsMap.get(Number(msg.opponent_stream_id));
    if (!oppStream || oppStream.id === stream.id) { liveSend(ws, { type: 'live_error', reason: 'not_found' }); return; }
    if (stream.pk || oppStream.pk) { liveSend(ws, { type: 'live_error', reason: 'pk_busy' }); return; }
    const oppHost = oppStream.seats.get(oppStream.hostId);
    if (!oppHost) return;
    if ([...pkInvites.values()].some(i => [i.from,i.to].includes(stream.id) || [i.from,i.to].includes(oppStream.id))) { liveSend(ws,{type:'live_error',reason:'pk_invite_pending'}); return; }
    const inviteId = 'pki_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const invite = { id: inviteId, from: stream.id, to: oppStream.id, expiresAt: Date.now() + PK_INVITE_MS };
    invite.timer = setTimeout(() => {
      if (!pkInvites.delete(inviteId)) return;
      liveSend(ws, { type: 'pk_invite_expired', invite_id: inviteId });
      liveSend(oppHost.ws, { type: 'pk_invite_expired', invite_id: inviteId });
    }, PK_INVITE_MS);
    pkInvites.set(inviteId, invite);
    const host = stream.seats.get(stream.hostId) || {};
    liveSend(oppHost.ws, { type: 'pk_invite', invite_id: inviteId, requester_stream_id: stream.id,
      host_name: host.name, host_photo: host.photo, expires_at: invite.expiresAt });
    liveSend(ws, { type: 'pk_invite_sent', invite_id: inviteId, opponent_stream_id: oppStream.id, expires_at: invite.expiresAt });
    console.log('WS: PK devet gonderildi - stream=' + stream.id + ' -> ' + oppStream.id);
} else if (msg.type === 'respond_pk') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !wsUser || stream.hostId !== wsUser.id) return;
    const invite = pkInvites.get(String(msg.invite_id));
    if (!invite || invite.to !== stream.id || invite.expiresAt < Date.now()) { liveSend(ws, { type: 'live_error', reason: 'pk_invite_expired' }); return; }
    clearTimeout(invite.timer); pkInvites.delete(invite.id);
    const requesterStream = liveStreamsMap.get(invite.from);
    if (!requesterStream || requesterStream.pk || stream.pk) return;
    if (!msg.accept) {
      const reqHost = requesterStream.seats.get(requesterStream.hostId);
      if (reqHost) liveSend(reqHost.ws, { type: 'pk_declined', invite_id: invite.id });
      return;
    }
    const hostA = requesterStream.seats.get(requesterStream.hostId);
    const hostB = stream.seats.get(stream.hostId);
    if (!hostA || !hostB) { liveSend(ws,{type:'live_error',reason:'not_found'}); return; }
    const pkId = 'pk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const session = { id: pkId, streamA: requesterStream.id, streamB: stream.id, hostA: requesterStream.hostId,
      hostB: stream.hostId, scoreA: 0, scoreB: 0, supporters: {}, phase: 'countdown',
      startsAt: Date.now() + PK_COUNTDOWN_MS, endsAt: Date.now() + PK_COUNTDOWN_MS + PK_BATTLE_MS };
    requesterStream.pk = { id: pkId, side: 'A', otherStreamId: stream.id, active: true };
    stream.pk = { id: pkId, side: 'B', otherStreamId: requesterStream.id, active: true };
    pkSessions.set(pkId, session);
    liveBroadcast(requesterStream, pkSnapshot(requesterStream));
    liveBroadcast(stream, pkSnapshot(stream));
    requesterStream.viewers.forEach((uid) => liveSend(hostB.ws, { type: 'live_new_viewer', viewer_id: String(uid) }));
    stream.viewers.forEach((uid) => liveSend(hostA.ws, { type: 'live_new_viewer', viewer_id: String(uid) }));
    console.log('WS: PK basladi - ' + requesterStream.id + ' vs ' + stream.id);
    session.countdownTimer = setTimeout(() => {
      if (!pkSessions.has(pkId) || session.phase !== 'countdown') return;
      session.phase = 'battle';
      pkBroadcast(session, { type: 'pk_phase', phase: 'battle', ends_at: session.endsAt });
      session.battleTimer = setTimeout(() => finishPk(session, 'time'), Math.max(0, session.endsAt - Date.now()));
    }, PK_COUNTDOWN_MS);
} else if (msg.type === 'end_pk') {
    const stream = liveStreamsMap.get(Number(msg.stream_id));
    if (!stream || !stream.pk || !wsUser || stream.hostId !== wsUser.id) return;
    finishPk(pkSessions.get(stream.pk.id), 'host_ended');
} else if (msg.type === 'user_kickout') {
    if (!wsUser || !Boolean(wsUser.is_vip) || !ws.gameRoom) return;
    const kickerCrystalsRow = db.prepare('SELECT crystals FROM users WHERE id = ?').get(wsUser.id);
    if (!kickerCrystalsRow || (kickerCrystalsRow.crystals || 0) < 60) {
      ws.send(encodeMessage({ type: 'live_error', reason: 'insufficient_crystals', packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
      return;
    }
    db.prepare('UPDATE users SET crystals = crystals - 60 WHERE id = ?').run(wsUser.id);
    const targetIdKO = Number(msg.user_id);
    let targetWsKO = null;
    let targetPlayerKO = null;
    ws.gameRoom.players.forEach((p, cws) => { if (Number(p.id) === targetIdKO) { targetWsKO = cws; targetPlayerKO = p; } });
    if (!targetWsKO || !targetPlayerKO) return;
    if (!ws.gameRoom.pendingKickouts) ws.gameRoom.pendingKickouts = new Map();
    if (ws.gameRoom.pendingKickouts.has(targetIdKO)) return;
    const deadlineTsKO = Date.now() + 30000;
    const timeoutHandleKO = setTimeout(() => {
      const room = ws.gameRoom;
      if (!room || !room.pendingKickouts || !room.pendingKickouts.has(targetIdKO)) return;
      room.pendingKickouts.delete(targetIdKO);
      const rejoinUntilMs = Date.now() + 15 * 60 * 1000;
      db.prepare('UPDATE users SET kicked_until = ?, kicked_from_game_id = ? WHERE id = ?').run(new Date(rejoinUntilMs).toISOString(), room.gameId, targetIdKO);
      broadcastToRoom(room, null, {
        type: 'user_kicked',
        kicker_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== 'female', photo_url: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '' },
        kicked_user: { id: String(targetIdKO), name: targetPlayerKO.name, male: targetPlayerKO.male, photo_url: targetPlayerKO.photo_url || '' },
        unkick_ts: rejoinUntilMs,
        game_id: room.gameId
      });
      
      if (targetWsKO.gameRoom) removePlayerFromRoom(targetWsKO.gameRoom, targetWsKO);
      let moveNewRoom = null;
      for (const r of rooms.values()) { if (r.gameId !== room.gameId && r.players.size < MAX_SEATS) { moveNewRoom = r; break; } }
      if (!moveNewRoom) moveNewRoom = createRoom();
      const moveSeat = getNextSeatInRoom(moveNewRoom);
      const movedPlayer = targetPlayerKO ? Object.assign({}, targetPlayerKO, { seat: moveSeat }) : null;
      if (movedPlayer) {
        const moveExisting = [];
        moveNewRoom.players.forEach(p => moveExisting.push(p));
        moveNewRoom.players.set(targetWsKO, movedPlayer);
        targetWsKO.gameRoom = moveNewRoom;
        targetWsKO.gamePlayer = movedPlayer;
        targetWsKO.send(encodeMessage({
          type: 'game_enter',
          packet: targetWsKO.packetCounter=(targetWsKO.packetCounter||1000)+1,
          game_id: moveNewRoom.gameId,
          bottle_type: moveNewRoom.bottleType || 'vipbottle',
          participants: [movedPlayer, ...moveExisting],
          abtest: { kickout: true },
          kickout_info: { price: 60, refresh_ms: 60000 }
        }));
        broadcastToRoom(moveNewRoom, targetWsKO, { type: 'game_join', user: movedPlayer });
        startBottleTurn(moveNewRoom);
      }
      console.log('WS: kickout - istifadeci kenarlasdirildi - target=' + targetIdKO);
    }, 30000);
    ws.gameRoom.pendingKickouts.set(targetIdKO, { initiatorId: wsUser.id, timeoutHandle: timeoutHandleKO, deadlineTs: deadlineTsKO });
    broadcastToRoom(ws.gameRoom, null, {
      type: 'user_kickout',
      kicker_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== 'female', photo_url: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '' },
      kicked_user: { id: String(targetIdKO), name: targetPlayerKO.name, male: targetPlayerKO.male, photo_url: targetPlayerKO.photo_url || '' },
      kickout_ts: deadlineTsKO,
      kickout_info: { price: 60 }
    });
    console.log('WS: kickout baslandi - initiator=' + wsUser.username + ' target=' + targetIdKO);
} else if (msg.type === 'user_save') {
    if (!wsUser) return;
    const targetIdSave = Number(msg.user_id);
    let saveRoom = null;
    let pending = null;
    for (const r of rooms.values()) {
      if (r.pendingKickouts && r.pendingKickouts.has(targetIdSave)) { saveRoom = r; pending = r.pendingKickouts.get(targetIdSave); break; }
    }
    if (pending) {
      if (!Boolean(wsUser.is_vip)) {
        ws.send(encodeMessage({ type: 'live_error', reason: 'vip_required', packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
        return;
      }
      const saverCoinsRow = db.prepare('SELECT coins FROM users WHERE id = ?').get(wsUser.id);
      if (!saverCoinsRow || (saverCoinsRow.coins || 0) < 100) {
        ws.send(encodeMessage({ type: 'live_error', reason: 'insufficient_coins', packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
        return;
      }
      db.prepare('UPDATE users SET coins = coins - 100 WHERE id = ?').run(wsUser.id);
    }
    if (!pending || !saveRoom) return;
    clearTimeout(pending.timeoutHandle);
    saveRoom.pendingKickouts.delete(targetIdSave);
    let savedPlayer = null;
    saveRoom.players.forEach((p) => { if (Number(p.id) === targetIdSave) savedPlayer = p; });
    broadcastToRoom(saveRoom, null, {
      type: 'user_save',
      saviour_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== 'female', photo_url: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '' },
      saved_user: { id: String(targetIdSave), name: savedPlayer ? savedPlayer.name : '', male: savedPlayer ? savedPlayer.male : true, photo_url: savedPlayer ? (savedPlayer.photo_url || '') : '' },
      kickout_info: { price: 60 }
    });
    console.log('WS: kickout xilas edildi - saver=' + wsUser.username + ' target=' + targetIdSave);
} else if (msg.type === 'kickout_refresh') {
    if (!ws) return;
    ws.send(encodeMessage({ type: 'kickout_refresh', kickout_info: { price: 60 }, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
} else if (msg.type === 'goto_user') {
        console.log('WS: goto_user alindi - target=' + msg.user_id);
        const targetWs = userIdToWs.get(Number(msg.user_id));
        if (targetWs && targetWs.gameRoom && targetWs.gameRoom.players.size < MAX_SEATS) {
          if (ws.gameRoom) {
            removePlayerFromRoom(ws.gameRoom, ws);
          }
          const destRoom = targetWs.gameRoom;
          const destSeat = getNextSeatInRoom(destRoom);
          let rejoinedPlayer2 = ws.gamePlayer ? Object.assign({}, ws.gamePlayer, { seat: destSeat }) : null;
          if (rejoinedPlayer2) {
            delete rejoinedPlayer2.ava_gift;
            delete rejoinedPlayer2.ava_gift_random;
            delete rejoinedPlayer2.hat;
            delete rejoinedPlayer2.drink;
            if (rejoinedPlayer2.id && destRoom.stickedGifts.has(rejoinedPlayer2.id)) {
              const freshGifts2 = destRoom.stickedGifts.get(rejoinedPlayer2.id);
              if (freshGifts2.ava_gift) { rejoinedPlayer2.ava_gift = freshGifts2.ava_gift; rejoinedPlayer2.ava_gift_random = freshGifts2.ava_gift_random; }
              if (freshGifts2.hat) rejoinedPlayer2.hat = freshGifts2.hat;
              if (freshGifts2.drink) rejoinedPlayer2.drink = freshGifts2.drink;
            }
          }
          if (rejoinedPlayer2) {
            const others2 = [];
            destRoom.players.forEach(p => others2.push(p));
            if (wsUser && isKickedFromRoom(wsUser.id, destRoom.gameId)) {
              ws.send(encodeMessage({ type: 'kickout_info', kickout_ts: wsUser.kicked_until, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
              return;
            }
            destRoom.players.set(ws, rejoinedPlayer2);
            ws.gamePlayer = rejoinedPlayer2;
            ws.gameRoom = destRoom;
        if (rejoinedPlayer2 && rejoinedPlayer2.id) { try { db.prepare('INSERT INTO visited_rooms (user_id, room_id, last_visited_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(user_id, room_id) DO UPDATE SET last_visited_at = excluded.last_visited_at').run(rejoinedPlayer2 && rejoinedPlayer2.id, destRoom.gameId); } catch(e) {} }
            const reGameEnter2 = {
              type: 'game_enter',
              packet: ws.packetCounter++,
              game_id: destRoom.gameId,
              bottle_type: destRoom.bottleType || 'vipbottle',
              participants: [rejoinedPlayer2, ...others2]
            };
            ws.send(encodeMessage(reGameEnter2));
          if (destRoom.chatHistory && destRoom.chatHistory.length > 0) {
            const cleanHistorySwitch = destRoom.chatHistory.map(function(histMsg) {
              const freshMsg = Object.assign({}, histMsg);
              delete freshMsg.packet;
              return freshMsg;
            });
            ws.send(encodeMessage({ type: 'game_chat_history', messages: cleanHistorySwitch, packet: ws.packetCounter = (ws.packetCounter || 1000) + 1 }));
          }
            console.log('WS: fellow-a qowuldu - masa=' + destRoom.gameId);
            broadcastToRoom(destRoom, ws, { type: 'game_join', user: rejoinedPlayer2 });
            startBottleTurn(destRoom);
            if (destRoom.currentSong && (Date.now() - destRoom.currentSong.start_timestamp) < ((destRoom.currentSong.duration || 240) * 1000)) {
              const songReplay3 = Object.assign({}, destRoom.currentSong);
              const realElapsedSec3 = (Date.now() - songReplay3.start_timestamp) / 1000;
              const safeDuration3 = (songReplay3.duration || 999) - 5;
              if (realElapsedSec3 > safeDuration3) {
                songReplay3.start_timestamp = Date.now() - (safeDuration3 * 1000);
              }
              songReplay3.packet = ws.packetCounter++;
              ws.send(encodeMessage(songReplay3));
            }
          }
        } else {
          console.log('WS: goto_user - hedef tapilmadi ve ya masa doludur');
        }
      } else if (msg.type === 'get_activity_status') {
        if (wsUser) {
          const statusRow = db.prepare('SELECT daily_active_seconds FROM users WHERE id = ?').get(wsUser.id);
          const seconds = (statusRow && statusRow.daily_active_seconds) || 0;
          const today5 = new Date().toISOString().slice(0, 10);
          const top5c = db.prepare('SELECT id, username, display_name, daily_message_count FROM users WHERE daily_message_date = ? ORDER BY daily_message_count DESC LIMIT 5').all(today5);
          const topHours = db.prepare('SELECT id, username, display_name, daily_active_seconds FROM users WHERE daily_active_date = ? ORDER BY daily_active_seconds DESC LIMIT 5').all(today5);
          const topMusic = db.prepare('SELECT id, username, display_name, daily_music_count FROM users WHERE daily_music_date = ? ORDER BY daily_music_count DESC LIMIT 5').all(today5);
          ws.send(encodeMessage({
            packet: ws.packetCounter = (ws.packetCounter||1000)+1,
            type: 'activity_status',
            active_seconds: seconds,
            leaderboard: top5c.map(u => ({ id: String(u.id), name: u.display_name || u.username, count: u.daily_message_count })),
            hour_leaderboard: topHours.map(u => ({ id: String(u.id), name: u.display_name || u.username, seconds: u.daily_active_seconds })),
            music_leaderboard: topMusic.map(u => ({ id: String(u.id), name: u.display_name || u.username, count: u.daily_music_count }))
          }));
        }
      } else if (msg.type === 'claim_hour_reward') {
        if (wsUser) {
          const row = db.prepare('SELECT daily_active_seconds, claimed_hour_milestones FROM users WHERE id = ?').get(wsUser.id);
          const seconds = row.daily_active_seconds || 0;
          const claimed = (row.claimed_hour_milestones || '').split(',').filter(Boolean);
          const cycleLen = 36000;
          const cycleNum = Math.floor(seconds / cycleLen);
          const posInCycle = seconds % cycleLen;
          const milestones = [{ h: 3, sec: 10800, bonus: 300 }, { h: 5, sec: 18000, bonus: 500 }, { h: 10, sec: 36000, bonus: 1000 }];
          let awarded = null;
          for (const m of milestones) {
            const key = cycleNum + ':' + m.h;
            const reached = m.h === 10 ? (posInCycle >= 35999 || seconds >= (cycleNum + 1) * cycleLen) : (posInCycle >= m.sec);
            if (reached && claimed.indexOf(key) < 0) { awarded = { key, bonus: m.bonus, h: m.h }; break; }
          }
          if (awarded) {
            claimed.push(awarded.key);
            db.prepare('UPDATE users SET coins = coins + ?, claimed_hour_milestones = ? WHERE id = ?').run(awarded.bonus, claimed.join(','), wsUser.id);
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'hour_reward_claimed', bonus: awarded.bonus, hours: awarded.h }));
            console.log('WS: saatlik bonus verildi - ' + wsUser.username + ' - ' + awarded.bonus);
          } else {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'hour_reward_claimed', bonus: 0 }));
          }
        }
      } else if (msg.type === 'get_msg_leaderboard') {
        const today3 = new Date().toISOString().slice(0, 10);
        const top5 = db.prepare('SELECT id, username, display_name, daily_message_count FROM users WHERE daily_message_date = ? ORDER BY daily_message_count DESC LIMIT 5').all(today3);
        ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'msg_leaderboard', list: top5.map(u => ({ id: String(u.id), name: u.display_name || u.username, count: u.daily_message_count })) }));
      } else if (msg.type === 'claim_msg_rank') {
        if (wsUser) {
          const today4 = new Date().toISOString().slice(0, 10);
          const already = db.prepare('SELECT claimed_msg_rank_date FROM users WHERE id = ?').get(wsUser.id);
          if (already && already.claimed_msg_rank_date === today4) {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'msg_rank_claimed', bonus: 0, reason: 'already_claimed' }));
          } else {
            const top5b = db.prepare('SELECT id FROM users WHERE daily_message_date = ? ORDER BY daily_message_count DESC LIMIT 5').all(today4);
            const rank = top5b.findIndex(u => u.id === wsUser.id);
            const rewards = [1000, 500, 300, 200, 100];
            if (rank >= 0) {
              const bonus = rewards[rank];
              db.prepare('UPDATE users SET coins = coins + ?, claimed_msg_rank_date = ? WHERE id = ?').run(bonus, today4, wsUser.id);
              ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'msg_rank_claimed', bonus: bonus, rank: rank + 1 }));
              console.log('WS: mesaj reytingi bonusu - ' + wsUser.username + ' - yer=' + (rank + 1) + ' bonus=' + bonus);
            } else {
              ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'msg_rank_claimed', bonus: 0, reason: 'not_in_top5' }));
            }
          }
        }
      } else if (msg.type === 'mod_mute') {
        if (wsUser && wsUser.is_moderator && msg.target_id) {
          const targetName = db.prepare('SELECT display_name, username FROM users WHERE id = ?').get(Number(msg.target_id));
          if (msg.unmute) {
            db.prepare('UPDATE users SET muted_until = NULL WHERE id = ?').run(Number(msg.target_id));
            if (ws.gameRoom) broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: 'Moderator ' + (wsUser.display_name || wsUser.username) + ' istifadecini (' + (targetName ? (targetName.display_name || targetName.username) : msg.target_id) + ') sesini acdi', receiver_id: '', receiver_name: '', user: { id: '0', name: 'Sistem', male: true } });
            console.log('WS: moderator ses acdi - ' + wsUser.username + ' -> ' + msg.target_id);
          } else {
            const minutes = Number(msg.minutes) || 10;
            db.prepare("UPDATE users SET muted_until = datetime('now', '+' || ? || ' minutes') WHERE id = ?").run(minutes, Number(msg.target_id));
            if (ws.gameRoom) broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: 'Moderator ' + (wsUser.display_name || wsUser.username) + ' istifadecini (' + (targetName ? (targetName.display_name || targetName.username) : msg.target_id) + ') ' + minutes + ' deqiqe susdurdu', receiver_id: '', receiver_name: '', user: { id: '0', name: 'Sistem', male: true } });
            console.log('WS: moderator susdurdu - ' + wsUser.username + ' -> ' + msg.target_id + ' (' + minutes + 'deq)');
          }
        }
      } else if (msg.type === 'mod_giftban') {
        if (wsUser && wsUser.is_moderator && msg.target_id) {
          const targetName2 = db.prepare('SELECT display_name, username FROM users WHERE id = ?').get(Number(msg.target_id));
          if (msg.unban) {
            db.prepare('UPDATE users SET gift_banned_until = NULL WHERE id = ?').run(Number(msg.target_id));
            if (ws.gameRoom) broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: 'Moderator ' + (wsUser.display_name || wsUser.username) + ' istifadecinin (' + (targetName2 ? (targetName2.display_name || targetName2.username) : msg.target_id) + ') hediyye qadagasini acdi', receiver_id: '', receiver_name: '', user: { id: '0', name: 'Sistem', male: true } });
            console.log('WS: moderator hediyye qadagasi acdi - ' + wsUser.username + ' -> ' + msg.target_id);
          } else {
            const minutes2 = Number(msg.minutes) || 10;
            db.prepare("UPDATE users SET gift_banned_until = datetime('now', '+' || ? || ' minutes') WHERE id = ?").run(minutes2, Number(msg.target_id));
            if (ws.gameRoom) broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: 'Moderator ' + (wsUser.display_name || wsUser.username) + ' istifadecinin (' + (targetName2 ? (targetName2.display_name || targetName2.username) : msg.target_id) + ') hediyye gondermesini ' + minutes2 + ' deqiqe qadagan etdi', receiver_id: '', receiver_name: '', user: { id: '0', name: 'Sistem', male: true } });
            console.log('WS: moderator hediyye qadagasi qoydu - ' + wsUser.username + ' -> ' + msg.target_id);
          }
        }
      } else if (msg.type === 'mod_kick') {
        if (wsUser && wsUser.is_moderator && msg.target_id) {
          const minutes3 = Number(msg.minutes) || 60;
          const targetName3 = db.prepare('SELECT display_name, username FROM users WHERE id = ?').get(Number(msg.target_id));
          db.prepare("UPDATE users SET kicked_until = datetime('now', '+' || ? || ' minutes') WHERE id = ?").run(minutes3, Number(msg.target_id));
          const targetWsKick = userIdToWs.get(Number(msg.target_id));
          if (targetWsKick) {
            targetWsKick.send(encodeMessage({ packet: targetWsKick.packetCounter = (targetWsKick.packetCounter||1000)+1, type: 'you_are_kicked', minutes: minutes3 }));
            if (targetWsKick.gameRoom) removePlayerFromRoom(targetWsKick.gameRoom, targetWsKick);
          }
          if (ws.gameRoom) broadcastToRoom(ws.gameRoom, null, { type: 'game_chat', body: 'Moderator ' + (wsUser.display_name || wsUser.username) + ' istifadecini (' + (targetName3 ? (targetName3.display_name || targetName3.username) : msg.target_id) + ') ' + minutes3 + ' deqiqeliyine masadan qovdu', receiver_id: '', receiver_name: '', user: { id: '0', name: 'Sistem', male: true } });
          console.log('WS: moderator qovdu - ' + wsUser.username + ' -> ' + msg.target_id + ' (' + minutes3 + 'deq)');
        }
      } else if (msg.type === 'buy_friendship_pass') {
        if (wsUser) {
          const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(wsUser.id);
          const hasActivePass = currentUser.friendship_pass_expires && new Date(currentUser.friendship_pass_expires) > new Date();
          if (hasActivePass) {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'friendship_pass_status', active: true, expires_at: currentUser.friendship_pass_expires }));
            console.log('WS: dostluq pasportu artiq aktivdir - ' + wsUser.username);
          } else if (currentUser.crystals < 1000) {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'friend_request_error', reason: 'insufficient_crystals' }));
            console.log('WS: dostluq pasportu reddedildi - kifayet qeder kristal yoxdur - ' + wsUser.username);
          } else {
            db.prepare("UPDATE users SET crystals = crystals - 1000, friendship_pass_expires = datetime('now', '+30 days') WHERE id = ?").run(wsUser.id);
            const updatedUser = db.prepare('SELECT friendship_pass_expires FROM users WHERE id = ?').get(wsUser.id);
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'friendship_pass_status', active: true, expires_at: updatedUser.friendship_pass_expires }));
            console.log('WS: dostluq pasportu alindi - ' + wsUser.username);
          }
        }
      } else if (msg.type === 'friend_request') {
        if (wsUser && msg.receiver_id && Number(msg.receiver_id) !== wsUser.id) {
          const currentUser2 = db.prepare('SELECT crystals, friendship_pass_expires FROM users WHERE id = ?').get(wsUser.id);
          let hasActivePass2 = currentUser2 && currentUser2.friendship_pass_expires && new Date(currentUser2.friendship_pass_expires) > new Date();
          if (!hasActivePass2) {
            if (!currentUser2 || currentUser2.crystals < 1000) {
              ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'friend_request_error', reason: 'insufficient_crystals' }));
              console.log('WS: dostluq teklifi reddedildi - kifayet qeder kristal yoxdur - ' + wsUser.username);
              return;
            }
            db.prepare("UPDATE users SET crystals = crystals - 1000, friendship_pass_expires = datetime('now', '+30 days') WHERE id = ?").run(wsUser.id);
            hasActivePass2 = true;
            console.log('WS: dostluq pasportu avtomatik alindi - ' + wsUser.username);
          }
          const existing = db.prepare('SELECT * FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').get(wsUser.id, Number(msg.receiver_id), Number(msg.receiver_id), wsUser.id);
          if (!existing) {
            db.prepare('INSERT INTO friendships (user_id, friend_id, status, requested_by) VALUES (?, ?, ?, ?)').run(wsUser.id, Number(msg.receiver_id), 'pending', wsUser.id);
            const targetWsFriend = userIdToWs.get(Number(msg.receiver_id));
            if (targetWsFriend && targetWsFriend.readyState === WebSocket.OPEN) {
              targetWsFriend.send(encodeMessage({ packet: targetWsFriend.packetCounter = (targetWsFriend.packetCounter||1000)+1, type: 'friend_request', sender_id: String(wsUser.id), sender_name: wsUser.display_name || wsUser.username }));
            }
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'friend_request_sent_ok' }));
            console.log('WS: dostluq teklifi gonderildi - ' + wsUser.username + ' -> ' + msg.receiver_id);
          } else {
            if (existing.status === 'pending') {
              const targetWsResend = userIdToWs.get(Number(msg.receiver_id));
              if (targetWsResend && targetWsResend.readyState === WebSocket.OPEN) {
                targetWsResend.send(encodeMessage({ packet: targetWsResend.packetCounter = (targetWsResend.packetCounter||1000)+1, type: 'friend_request', sender_id: String(wsUser.id), sender_name: wsUser.display_name || wsUser.username }));
                console.log('WS: dostluq teklifi yeniden gonderildi (pending idi) - ' + wsUser.username + ' -> ' + msg.receiver_id);
              }
            }
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'friend_request_sent_ok', already_exists: true }));
            console.log('WS: dostluq teklifi artiq movcuddur - ' + wsUser.username + ' -> ' + msg.receiver_id);
          }
        }} else if (msg.type === 'friend_accept') {
        if (wsUser && msg.sender_id) {
          db.prepare("UPDATE friendships SET status = ?, expires_at = datetime('now', '+30 days') WHERE user_id = ? AND friend_id = ?").run('accepted', Number(msg.sender_id), wsUser.id);
          const targetWsAccept = userIdToWs.get(Number(msg.sender_id));
          if (targetWsAccept && targetWsAccept.readyState === WebSocket.OPEN) {
            targetWsAccept.send(encodeMessage({ packet: targetWsAccept.packetCounter = (targetWsAccept.packetCounter||1000)+1, type: 'friend_accepted', friend_id: String(wsUser.id), friend_name: wsUser.display_name || wsUser.username }));
          }
          console.log('WS: dostluq qebul edildi - ' + wsUser.username + ' + ' + msg.sender_id);
        }
      } else if (msg.type === 'friend_reject') {
        if (wsUser && msg.sender_id) {
          db.prepare('DELETE FROM friendships WHERE user_id = ? AND friend_id = ?').run(Number(msg.sender_id), wsUser.id);
          console.log('WS: dostluq redd edildi - ' + wsUser.username + ' - ' + msg.sender_id);
        }
      } else if (msg.type === 'bottle_tap_speedup') {
        if (ws.gameRoom && ws.gameRoom.finishSpin && ws.gameRoom.bottleTimer) {
          clearTimeout(ws.gameRoom.bottleTimer);
          ws.gameRoom.finishSpin();
        }
      } else if (msg.type === 'buy_premium_pass') {
        if (wsUser) {
          const seasonStartRow2 = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('season_start_ms');
          const seasonStart2 = seasonStartRow2 ? Number(seasonStartRow2.value) : Date.now();
          const alreadyHas = db.prepare('SELECT id FROM pass_purchases WHERE user_id = ? AND season_start_ms = ?').get(wsUser.id, seasonStart2);
          if (alreadyHas) {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'premium_pass_error', reason: 'already_active' }));
          } else {
            const currentUser2 = db.prepare('SELECT crystals FROM users WHERE id = ?').get(wsUser.id);
            if (currentUser2.crystals < 500) {
              ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'premium_pass_error', reason: 'not_enough_crystals' }));
            } else {
              db.prepare('UPDATE users SET crystals = crystals - 500 WHERE id = ?').run(wsUser.id);
              db.prepare('INSERT INTO pass_purchases (user_id, season_start_ms) VALUES (?, ?) ON CONFLICT(user_id, season_start_ms) DO NOTHING').run(wsUser.id, seasonStart2);
              ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'premium_pass_purchased' }));
              console.log('WS: premium pass alindi - ' + wsUser.username);
            }
          }
        }
      } else if (msg.type === 'get_favorite_songs') {
        if (wsUser) {
          let normFolder = msg.folder || 'default';
          if (normFolder === 'fav_videos') normFolder = 'fav_songs';
          if (normFolder === 'history_videos') normFolder = 'history_songs';
          console.log('FAV-DEBUG: get_favorite_songs cagirildi - user=' + wsUser.id + ' folder=' + msg.folder + ' norm=' + normFolder);
          const favSongs = db.prepare('SELECT song_id FROM music_favorites WHERE user_id = ? AND folder = ? ORDER BY created_at DESC').all(wsUser.id, normFolder);
          console.log('FAV-DEBUG: tapilan songs=' + JSON.stringify(favSongs.map(f => f.song_id)));
          ws.send(encodeMessage({ type: 'favorite_songs', song_ids: favSongs.map(f => f.song_id), max_items: 30 }));
        }
      } else if (msg.type === 'mark_song_favorite') {
        if (wsUser && msg.song_id) {
          let normFolder2 = msg.folder || 'default';
          if (normFolder2 === 'fav_videos') normFolder2 = 'fav_songs';
          if (normFolder2 === 'history_videos') normFolder2 = 'history_songs';
          if (msg.favorite) {
            db.prepare('INSERT INTO music_favorites (user_id, folder, song_id) VALUES (?, ?, ?) ON CONFLICT(user_id, folder, song_id) DO NOTHING').run(wsUser.id, normFolder2, msg.song_id);
          } else {
            db.prepare('DELETE FROM music_favorites WHERE user_id = ? AND folder = ? AND song_id = ?').run(wsUser.id, normFolder2, msg.song_id);
          }
        }
      } else if (msg.type === 'date_invite') {
        if (wsUser && msg.target_id) {
          const isFriendCheck = db.prepare('SELECT 1 FROM friendships WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = ?').get(wsUser.id, Number(msg.target_id), Number(msg.target_id), wsUser.id, 'accepted');
          if (isFriendCheck) {
            const targetWsDate = userIdToWs.get(Number(msg.target_id));
            if (targetWsDate && targetWsDate.readyState === WebSocket.OPEN) {
              targetWsDate.send(encodeMessage({ packet: targetWsDate.packetCounter = (targetWsDate.packetCounter||1000)+1, type: 'date_invite', sender_id: String(wsUser.id), sender_name: wsUser.display_name || wsUser.username }));
              console.log('WS: gorus deveti gonderildi - ' + wsUser.username + ' -> ' + msg.target_id);
            } else {
              ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'date_invite_error', reason: 'not_online' }));
            }
          } else {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'date_invite_error', reason: 'not_friends' }));
          }
        }
      } else if (msg.type === 'date_accept') {
        if (wsUser && msg.sender_id) {
          const senderWsDate = userIdToWs.get(Number(msg.sender_id));
          if (senderWsDate && senderWsDate.readyState === WebSocket.OPEN) {
            if (ws.gameRoom) removePlayerFromRoom(ws.gameRoom, ws);
            if (senderWsDate.gameRoom) removePlayerFromRoom(senderWsDate.gameRoom, senderWsDate);
            const dateRoom = createRoom();
            dateRoom.isDateRoom = true;
            console.log('WS: gorus masasi yaradildi - ' + wsUser.username + ' + ' + msg.sender_id);
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'date_room_joined', game_id: dateRoom.gameId }));
            senderWsDate.send(encodeMessage({ packet: senderWsDate.packetCounter = (senderWsDate.packetCounter||1000)+1, type: 'date_room_joined', game_id: dateRoom.gameId }));
            senderWsDate.emit('message', encodeMessage({ type: 'game_join', game_id: dateRoom.gameId, target_room: dateRoom.gameId }));
            setTimeout(() => {
              ws.emit('message', encodeMessage({ type: 'game_join', game_id: dateRoom.gameId, target_room: dateRoom.gameId }));
            }, 200);
          } else {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'date_invite_error', reason: 'sender_offline' }));
          }
        }} else if (msg.type === 'date_reject') {
        if (wsUser && msg.sender_id) {
          const senderWsReject = userIdToWs.get(Number(msg.sender_id));
          if (senderWsReject && senderWsReject.readyState === WebSocket.OPEN) {
            senderWsReject.send(encodeMessage({ packet: senderWsReject.packetCounter = (senderWsReject.packetCounter||1000)+1, type: 'date_invite_rejected', target_name: wsUser.display_name || wsUser.username }));
          }
        }
      } else if (msg.type === 'game_private_message') {
        if (wsUser && msg.receiver_id && msg.body) {
          const gpMsg = {
            type: 'game_private_message',
            body: String(msg.body).substr(0, 200),
            sender_id: String(wsUser.id),
            sender_name: wsUser.display_name || wsUser.username,
            sender_male: wsUser.gender !== 'female',
            timestamp: Date.now()
          };
          const gpTargetWs = userIdToWs.get(Number(msg.receiver_id));
          if (gpTargetWs && gpTargetWs.readyState === WebSocket.OPEN) {
            gpTargetWs.send(encodeMessage(gpMsg));
          }
        }
      } else if (msg.type === 'private_message') {
        if (wsUser && msg.receiver_id && msg.body) {
          const isFriend = db.prepare("SELECT 1 FROM friendships WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = ? AND (expires_at IS NULL OR expires_at > datetime('now'))").get(wsUser.id, Number(msg.receiver_id), Number(msg.receiver_id), wsUser.id, 'accepted');
          if (!isFriend) {
            ws.send(encodeMessage({ packet: ws.packetCounter = (ws.packetCounter||1000)+1, type: 'private_message_error', reason: 'not_friends', receiver_id: msg.receiver_id }));
            console.log('WS: private_message reddedildi - dost deyil - ' + wsUser.username + ' -> ' + msg.receiver_id);
            return;
          }
          const privMsg = {
            type: 'private_message',
            body: String(msg.body).substr(0, 200),
            sender_id: String(wsUser.id),
            sender_name: wsUser.display_name || wsUser.username,
            timestamp: Date.now()
          };
          const targetWsPriv = userIdToWs.get(Number(msg.receiver_id));
          if (targetWsPriv && targetWsPriv.readyState === WebSocket.OPEN) {
            targetWsPriv.send(encodeMessage(privMsg));
          }
          ws.send(encodeMessage(Object.assign({}, privMsg, { to_self: true })));
          console.log('WS: private_message gonderildi - ' + wsUser.username + ' -> ' + msg.receiver_id);
        }
      }} catch (e) {
      console.log('WS RECV (decode xetasi):', e.stack);
    }
  });

  ws.on('close', () => {
    clearInterval(activityInterval);
    console.log('WS: baglandi');
    if (ws.nightRoomId) leaveNightRoom(ws, 'disconnect');
    if (wsUser) userIdToWs.delete(wsUser.id);
    if (ws.gameRoom) {
      removePlayerFromRoom(ws.gameRoom, ws);
    }
    if (ws.liveStreamId) {
      const s = liveStreamsMap.get(ws.liveStreamId);
      if (s) {
        if (wsUser && s.hostId === wsUser.id) {
          cancelPkForStream(s.id, 'host_disconnected');
          liveBroadcast(s, { type: 'live_ended', stream_id: s.id });
          liveStreamsMap.delete(ws.liveStreamId);
          console.log('WS: yayimci ayrildi, canli yayim bagladi - id=' + ws.liveStreamId);
        } else if (wsUser && s.seats.has(wsUser.id)) {
          s.seats.delete(wsUser.id);
          liveBroadcast(s, { type: 'live_seat_left', user_id: String(wsUser.id) });
        }
      }
    }
    if (ws.watchingStreamId) {
      const s2 = liveStreamsMap.get(ws.watchingStreamId);
      if (s2 && s2.viewers.has(ws)) {
        s2.viewers.delete(ws);
        liveBroadcast(s2, { type: 'live_viewer_left', viewer_id: String(ws.viewerIdInStream || ''), viewer_count: s2.viewers.size });
      }
    }
  });
});

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS
    }
});


// =====================
// ADMIN API
// =====================

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password, gender, birthdate } = req.body || {};

    if (!username || !password)
        return res.status(400).json({ error: 'missing_fields' });

    const admin = authLib.verifyAdmin(username, password);

    if (!admin)
        return res.status(401).json({ error: 'invalid_credentials' });

    const token = authLib.issueToken(admin);

    res.json({
        token,
        username: admin.username
    });
});

// B├╝t├╝n istifad╔Ö├ğil╔Ör
app.get('/api/admin/users', authLib.requireAdmin, (req, res) => {
    const q = (req.query.q || '').trim();
    let rows;
    if (q) {
        rows = db.prepare(`
            SELECT *
            FROM users
            WHERE username LIKE ?
               OR display_name LIKE ?
               OR telegram_id LIKE ?
               OR CAST(id AS TEXT) = ?
            ORDER BY id DESC
            LIMIT 200
        `).all(`%${q}%`, `%${q}%`, `%${q}%`, q);
    } else {
        rows = db.prepare(`
            SELECT *
            FROM users
            ORDER BY id DESC
            LIMIT 200
        `).all();
    }

    if (rows[0]) console.log('WS: DEBUG ilk istifadeci - ' + JSON.stringify(rows[0]));
    res.json(rows);

});

app.get('/api/admin/leaderboard', authLib.requireAdmin, (req, res) => {
    let lbResults = game.getLeaderboard(100);
    const lq = (req.query.q || '').trim();
    if (lq) {
        lbResults = lbResults.filter(function(u) { return String(u.id) === lq; });
    }
    res.json(lbResults);
});

app.post('/api/admin/users/:id/points', authLib.requireAdmin, (req, res) => {

    const { amount, reason } = req.body || {};

    if (typeof amount !== 'number')
        return res.status(400).json({ error: 'amount_required' });

    game.awardPoints(
        Number(req.params.id),
        amount,
        reason || 'admin_grant',
        req.admin.id
    );

    res.json(
        db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id)
    );

});

app.get('/api/admin/clear-all-friendships', (req, res) => {
    const result = db.prepare('DELETE FROM friendships').run();
    res.send('Temizlendi: ' + result.changes + ' dostluq qeydi silindi');
});
app.post('/api/admin/users/:id/moderator', authLib.requireAdmin, (req, res) => {
    const { is_moderator } = req.body || {};
    console.log('MODERATOR-DEBUG: id=' + req.params.id + ' is_moderator=' + is_moderator);
    const result = db.prepare('UPDATE users SET is_moderator = ? WHERE id = ?').run(is_moderator ? 1 : 0, req.params.id);
    console.log('MODERATOR-DEBUG: changes=' + result.changes);
    res.json({ success: true });
});
app.get('/api/admin/force-moderator/:id', (req, res) => {
    db.prepare('UPDATE users SET is_moderator = 1 WHERE id = ?').run(Number(req.params.id));
    const check = db.prepare('SELECT id, username, is_moderator FROM users WHERE id = ?').get(Number(req.params.id));
    res.json(check);
});
app.get('/api/admin/grant-all-achievements', (req, res) => {
    const achievementIds = ['alien','aurora','balalaika','barista','barman','bastilia','bear','captain','celebrity','chifir','childrenparty','coffeeman','combiner','courtesies','cowboy','csar','cuba','cupid','desant','diamond','dj','dj_score_daily_1','dj_score_daily_10','dj_score_monthly_1','dj_score_monthly_10','dj_score_weekly_1','dj_score_weekly_10','donjuan','ersh','extrovert','fanatic','festivefirework','fidget','flot','flowers','foreveralone','frog','gambler','general','girlfriends','gold','guru','halloween','heartofgold','hemingway','hit','instyle','ivan','jack','jewelry','kindlysoul','kinoman','leaf','league_champion','league_lover','league_magister','league_pro','longliver','luckytoken','magic','manfriends','mexicanpassion','mexico','milkdrinker','mineral','mozart','mutuality','newcomer','newyear','online','palata6','pantomime','pepper','persistent','pirate','platinum','princess','purple','recorder','redoctober','romantic','rulesofdecorum','salieri','santa','seniorpomidor','shodka','slippers','slug','snow','sober','sommelier','sportsman','sweet','sweettosour','tamada','travel','vegan','weddingrings','wildjoy'];
    const achievementsJson = JSON.stringify(achievementIds.map(id => ({ achievement_id: id, timestamp: Date.now(), level: 5 })));
    const result = db.prepare('UPDATE users SET achievements = ?').run(achievementsJson);
    res.send('Butun istifadecilere ' + achievementIds.length + ' nailiyyet verildi. Deyisen setir sayi: ' + result.changes);
});
app.get('/api/admin/debug-music-cache', (req, res) => {
    const rows = db.prepare("SELECT key, value FROM app_settings WHERE key LIKE 'cilizmusic%'").all();
    res.json(rows);
});
app.get('/api/admin/top10-debug', (req, res) => {
    const kisses = db.prepare('SELECT id, display_name, username, total_kisses FROM users ORDER BY total_kisses DESC LIMIT 10').all();
    const gestures = db.prepare('SELECT id, display_name, username, gestures_sent FROM users ORDER BY gestures_sent DESC LIMIT 10').all();
    const price = db.prepare('SELECT id, display_name, username, price_stat FROM users ORDER BY price_stat DESC LIMIT 10').all();
    const harem = db.prepare('SELECT id, display_name, username, harem_price_stat FROM users ORDER BY harem_price_stat DESC LIMIT 10').all();
    res.json({ kisses, gestures, price, harem });
});
app.get('/api/admin/view-favorites', (req, res) => {
    const rows = db.prepare('SELECT * FROM music_favorites ORDER BY created_at DESC LIMIT 20').all();
    res.json(rows);
});
app.get('/api/admin/clear-music-cache', (req, res) => {
    const rows = db.prepare("SELECT key, value FROM app_settings WHERE key LIKE 'cilizmusic%'").all();
    let deletedCount = 0;
    for (const row of rows) {
      try {
        const parsed = JSON.parse(row.value);
        if (Array.isArray(parsed) && parsed.length === 0) {
          db.prepare('DELETE FROM app_settings WHERE key = ?').run(row.key);
          deletedCount++;
        }
      } catch (e) {}
    }
    res.send('Temizlendi: ' + deletedCount + ' bos mahni kesh qeydi silindi (toplam yoxlanan: ' + rows.length + ')');
});
app.get('/api/admin/grant-pass-frames/:id', (req, res) => {
    const userId = Number(req.params.id);
    const claims = db.prepare('SELECT * FROM pass_claims WHERE user_id = ?').all(userId);
    const ownedRow3 = db.prepare('SELECT owned_items FROM users WHERE id = ?').get(userId);
    let ownedItems3 = {};
    if (ownedRow3 && ownedRow3.owned_items) { try { ownedItems3 = JSON.parse(ownedRow3.owned_items); } catch (e) {} }
    const granted2 = [];
    for (const claim of claims) {
      const rewardRow2 = db.prepare('SELECT * FROM pass_level_rewards WHERE level = ?').get(claim.level);
      if (!rewardRow2) continue;
      const rewardType2 = claim.line === 'paid' ? rewardRow2.paid_reward_type : rewardRow2.free_reward_type;
      const rewardBoosterName2 = claim.line === 'paid' ? rewardRow2.paid_booster : rewardRow2.free_booster;
      if (rewardType2 === 'frame' && rewardBoosterName2) {
        ownedItems3[rewardBoosterName2] = true;
        granted2.push(rewardBoosterName2);
      }
    }
    db.prepare('UPDATE users SET owned_items = ? WHERE id = ?').run(JSON.stringify(ownedItems3), userId);
    res.json({ granted: granted2 });
});app.get('/api/admin/grant-league-frames/:id', (req, res) => {
    const userId = Number(req.params.id);
    const row = db.prepare('SELECT league_tier, owned_items FROM users WHERE id = ?').get(userId);
    if (!row) return res.json({ error: 'not_found' });
    const tierOrder = ['wood', 'rock', 'iron', 'steel', 'bronze', 'marble', 'silver', 'gold', 'platinum', 'amber', 'amethyst', 'topaz', 'pearls', 'sapphire', 'ruby', 'emerald', 'diamond'];
    const leagueFrameMap = { marble: 'silver', silver: 'gold', gold: 'platinum', platinum: 'amber', amber: 'amethyst', amethyst: 'topaz', topaz: 'pearls', pearls: 'sapphire', sapphire: 'ruby', ruby: 'emerald', emerald: 'diamond' };
    const myIdx = tierOrder.indexOf(row.league_tier || 'wood');
    let ownedItemsG = {};
    if (row.owned_items) { try { ownedItemsG = JSON.parse(row.owned_items); } catch (e) {} }
    const granted = [];
    for (let i = 0; i <= myIdx; i++) {
      const tierName = tierOrder[i];
      if (leagueFrameMap[tierName]) {
        ownedItemsG[leagueFrameMap[tierName]] = true;
        granted.push(leagueFrameMap[tierName]);
      }
    }
    db.prepare('UPDATE users SET owned_items = ? WHERE id = ?').run(JSON.stringify(ownedItemsG), userId);
    res.json({ granted });
});app.get('/api/messages/conversations', authLib.requireUser, (req, res) => {
    const convos = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar_data,
        (SELECT text FROM messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_text,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count
      FROM friendships f
      JOIN users u ON u.id = (CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END)
      WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
    `).all(req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id);
    res.json(convos.filter(c => c.last_text).map(u => ({
      id: u.id, username: u.username, display_name: u.display_name,
      photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : '',
      last_text: u.last_text, unread_count: u.unread_count
    })));
});
app.get('/api/messages/:userId', authLib.requireUser, (req, res) => {
    const otherId = Number(req.params.userId);
    const msgs = db.prepare(`
      SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC LIMIT 100
    `).all(req.user.id, otherId, otherId, req.user.id);
    db.prepare('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?').run(otherId, req.user.id);
    res.json(msgs.map(m => ({ id: m.id, text: m.text, sender_id: m.sender_id, created_at: m.created_at })));
});
app.post('/api/messages/:userId', authLib.requireUser, (req, res) => {
    const otherId = Number(req.params.userId);
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: 'empty_text' });
    const [uId, fId] = req.user.id < otherId ? [req.user.id, otherId] : [otherId, req.user.id];
    const friendship = db.prepare('SELECT status FROM friendships WHERE user_id = ? AND friend_id = ?').get(uId, fId);
    if (!friendship || friendship.status !== 'accepted') return res.status(403).json({ error: 'not_friends' });
    const result = db.prepare('INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)').run(req.user.id, otherId, text.trim());
    res.json({ id: result.lastInsertRowid, success: true });
});app.get('/api/shorts', authLib.requireUser, (req, res) => {
    const shorts = db.prepare(`
      SELECT s.*, u.username, u.display_name, u.avatar_data,
        (SELECT COUNT(*) FROM short_likes WHERE short_id = s.id) as likes_count,
        (SELECT COUNT(*) FROM short_comments WHERE short_id = s.id) as comments_count,
        (SELECT COUNT(*) FROM short_likes WHERE short_id = s.id AND user_id = ?) as liked_by_me
      FROM shorts s JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC LIMIT 30
    `).all(req.user.id);
    res.json(shorts.map(s => ({
      id: s.id, url: '/api/short-video/' + s.id, caption: s.caption, created_at: s.created_at,
      likes_count: s.likes_count, comments_count: s.comments_count, liked_by_me: Boolean(s.liked_by_me), views_count: s.views_count,
      user: { id: s.user_id, username: s.username, display_name: s.display_name, photo_url: s.avatar_data ? ('/api/avatar/' + s.user_id) : '' }
    })));
});
app.get('/api/short-video/:id', (req, res) => {
    const row = db.prepare('SELECT video_data FROM shorts WHERE id = ?').get(Number(req.params.id));
    if (!row) return res.status(404).send('not found');
    const base64Data = row.video_data.replace(/^data:video\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    res.set('Content-Type', 'video/mp4');
    res.send(buffer);
});
app.post('/api/shorts/upload', authLib.requireUser, (req, res) => {
    const { video_data, caption } = req.body || {};
    if (!video_data) return res.status(400).json({ error: 'no_video' });
    const result = db.prepare('INSERT INTO shorts (user_id, video_data, caption) VALUES (?, ?, ?)').run(req.user.id, video_data, caption || '');
    res.json({ id: result.lastInsertRowid, success: true });
});
app.post('/api/shorts/like/:shortId', authLib.requireUser, (req, res) => {
    const shortId = Number(req.params.shortId);
    const existing = db.prepare('SELECT 1 FROM short_likes WHERE short_id = ? AND user_id = ?').get(shortId, req.user.id);
    if (existing) {
      db.prepare('DELETE FROM short_likes WHERE short_id = ? AND user_id = ?').run(shortId, req.user.id);
      res.json({ liked: false });
    } else {
      db.prepare('INSERT INTO short_likes (short_id, user_id) VALUES (?, ?)').run(shortId, req.user.id);
      res.json({ liked: true });
    }
});
app.post('/api/shorts/comment/:shortId', authLib.requireUser, (req, res) => {
    const shortId = Number(req.params.shortId);
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: 'empty_text' });
    const result = db.prepare('INSERT INTO short_comments (short_id, user_id, text) VALUES (?, ?, ?)').run(shortId, req.user.id, text.trim());
    res.json({ id: result.lastInsertRowid, success: true });
});
app.get('/api/shorts/comments/:shortId', authLib.requireUser, (req, res) => {
    const shortId = Number(req.params.shortId);
    const comments = db.prepare(`
      SELECT c.*, u.username, u.display_name FROM short_comments c
      JOIN users u ON c.user_id = u.id WHERE c.short_id = ? ORDER BY c.created_at ASC
    `).all(shortId);
    res.json(comments.map(c => ({ id: c.id, text: c.text, user: { id: c.user_id, username: c.username, display_name: c.display_name } })));
});
app.post('/api/shorts/view/:shortId', authLib.requireUser, (req, res) => {
    db.prepare('UPDATE shorts SET views_count = views_count + 1 WHERE id = ?').run(Number(req.params.shortId));
    res.json({ success: true });
app.delete('/api/shorts/:shortId', authLib.requireUser, (req, res) => {
    const shortId = Number(req.params.shortId);
    const short = db.prepare('SELECT user_id FROM shorts WHERE id = ?').get(shortId);
    if (!short) return res.status(404).json({ error: 'not_found' });
    if (short.user_id !== req.user.id) return res.status(403).json({ error: 'not_owner' });
    db.prepare('DELETE FROM short_likes WHERE short_id = ?').run(shortId);
    db.prepare('DELETE FROM short_comments WHERE short_id = ?').run(shortId);
    db.prepare('DELETE FROM shorts WHERE id = ?').run(shortId);
    res.json({ success: true });
});
app.post('/api/shorts/delete/:shortId', authLib.requireUser, (req, res) => {
    const shortId2 = Number(req.params.shortId);
    const short2 = db.prepare('SELECT user_id FROM shorts WHERE id = ?').get(shortId2);
    if (!short2) return res.status(404).json({ error: 'not_found' });
    if (short2.user_id !== req.user.id) return res.status(403).json({ error: 'not_owner' });
    db.prepare('DELETE FROM short_likes WHERE short_id = ?').run(shortId2);
    db.prepare('DELETE FROM short_comments WHERE short_id = ?').run(shortId2);
    db.prepare('DELETE FROM shorts WHERE id = ?').run(shortId2);
    res.json({ success: true });
});
});app.get('/api/shorts/remove/:shortId', authLib.requireUser, (req, res) => {
    const shortId3 = Number(req.params.shortId);
    const short3 = db.prepare('SELECT user_id FROM shorts WHERE id = ?').get(shortId3);
    if (!short3) return res.status(404).json({ error: 'not_found' });
    if (short3.user_id !== req.user.id) return res.status(403).json({ error: 'not_owner' });
    db.prepare('DELETE FROM short_likes WHERE short_id = ?').run(shortId3);
    db.prepare('DELETE FROM short_comments WHERE short_id = ?').run(shortId3);
    db.prepare('DELETE FROM shorts WHERE id = ?').run(shortId3);
    res.json({ success: true });
});app.get('/api/photos', authLib.requireUser, (req, res) => {
    const targetUserId = req.query.user_id ? Number(req.query.user_id) : req.user.id;
    const photos = db.prepare(`
      SELECT p.id, p.user_id, p.created_at,
        (SELECT COUNT(*) FROM photo_reactions WHERE photo_id = p.id AND reaction = 'like') as likes_count,
        (SELECT COUNT(*) FROM photo_reactions WHERE photo_id = p.id AND reaction = 'dislike') as dislikes_count,
        (SELECT COUNT(*) FROM photo_comments WHERE photo_id = p.id) as comments_count,
        (SELECT reaction FROM photo_reactions WHERE photo_id = p.id AND user_id = ?) as my_reaction
      FROM photos p WHERE p.user_id = ? ORDER BY p.created_at DESC
    `).all(req.user.id, targetUserId);
    res.json(photos.map(p => ({
      id: p.id, url: '/api/photo-image/' + p.id, created_at: p.created_at,
      likes_count: p.likes_count, dislikes_count: p.dislikes_count, comments_count: p.comments_count, my_reaction: p.my_reaction
    })));
});
app.get('/api/photo-image/:id', (req, res) => {
    const row = db.prepare('SELECT image_data FROM photos WHERE id = ?').get(Number(req.params.id));
    if (!row) return res.status(404).send('not found');
    const buffer = Buffer.from(row.image_data, 'base64');
    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
});
app.post('/api/photos/upload', authLib.requireUser, (req, res) => {
    const { image_data } = req.body || {};
    if (!image_data) return res.status(400).json({ error: 'no_image' });
    const base64Data = image_data.replace(/^data:image\/\w+;base64,/, '');
    const result = db.prepare('INSERT INTO photos (user_id, image_data) VALUES (?, ?)').run(req.user.id, base64Data);
    res.json({ id: result.lastInsertRowid, success: true });
});
app.post('/api/photos/react/:photoId', authLib.requireUser, (req, res) => {
    const photoId = Number(req.params.photoId);
    const { reaction } = req.body || {};
    if (reaction !== 'like' && reaction !== 'dislike') return res.status(400).json({ error: 'invalid_reaction' });
    const existing = db.prepare('SELECT reaction FROM photo_reactions WHERE photo_id = ? AND user_id = ?').get(photoId, req.user.id);
    if (existing && existing.reaction === reaction) {
      db.prepare('DELETE FROM photo_reactions WHERE photo_id = ? AND user_id = ?').run(photoId, req.user.id);
      res.json({ reaction: null });
    } else {
      db.prepare('INSERT INTO photo_reactions (photo_id, user_id, reaction) VALUES (?, ?, ?) ON CONFLICT(photo_id, user_id) DO UPDATE SET reaction = excluded.reaction').run(photoId, req.user.id, reaction);
      const photoOwnerR = db.prepare('SELECT user_id FROM photos WHERE id = ?').get(photoId);
      if (photoOwnerR && photoOwnerR.user_id !== req.user.id) {
        db.prepare('INSERT INTO notifications (user_id, type, from_user_id, ref_id) VALUES (?, ?, ?, ?)').run(photoOwnerR.user_id, 'photo_reaction', req.user.id, photoId);
      }
      res.json({ reaction });
    }
});
app.post('/api/photos/comment/:photoId', authLib.requireUser, (req, res) => {
    const photoId = Number(req.params.photoId);
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: 'empty_text' });
    const result = db.prepare('INSERT INTO photo_comments (photo_id, user_id, text) VALUES (?, ?, ?)').run(photoId, req.user.id, text.trim());
    const photoOwnerC = db.prepare('SELECT user_id FROM photos WHERE id = ?').get(photoId);
    if (photoOwnerC && photoOwnerC.user_id !== req.user.id) {
      db.prepare('INSERT INTO notifications (user_id, type, from_user_id, ref_id, extra_text) VALUES (?, ?, ?, ?, ?)').run(photoOwnerC.user_id, 'photo_comment', req.user.id, photoId, text.trim());
    }
    res.json({ id: result.lastInsertRowid, success: true });
});
app.get('/api/photos/comments/:photoId', authLib.requireUser, (req, res) => {
    const photoId = Number(req.params.photoId);
    const comments = db.prepare(`
      SELECT c.*, u.username, u.display_name FROM photo_comments c
      JOIN users u ON c.user_id = u.id WHERE c.photo_id = ? ORDER BY c.created_at ASC
    `).all(photoId);
    res.json(comments.map(c => ({ id: c.id, text: c.text, user: { id: c.user_id, username: c.username, display_name: c.display_name } })));
});
app.post('/api/photos/set-profile/:photoId', authLib.requireUser, (req, res) => {
    const photoId = Number(req.params.photoId);
    const photo = db.prepare('SELECT image_data FROM photos WHERE id = ? AND user_id = ?').get(photoId, req.user.id);
    if (!photo) return res.status(404).json({ error: 'not_found' });
    db.prepare('UPDATE users SET avatar_data = ? WHERE id = ?').run('data:image/jpeg;base64,' + photo.image_data, req.user.id);
    res.json({ success: true });
});app.get('/api/profile/:userId', authLib.requireUser, (req, res) => {
    const targetId = Number(req.params.userId);
    const user = db.prepare('SELECT id, username, display_name, avatar_data, user_status, user_status_set_at, is_verified, gender FROM users WHERE id = ?').get(targetId);
    if (!user) return res.status(404).json({ error: 'not_found' });
    if (targetId !== req.user.id) {
      db.prepare('INSERT INTO profile_views (viewer_id, viewed_id) VALUES (?, ?)').run(req.user.id, targetId);
    }
    const [uId, fId] = req.user.id < targetId ? [req.user.id, targetId] : [targetId, req.user.id];
    const friendship = db.prepare('SELECT status FROM friendships WHERE user_id = ? AND friend_id = ?').get(uId, fId);
    res.json({
      id: user.id, username: user.username, display_name: user.display_name,
      photo_url: user.avatar_data ? ('/api/avatar/' + user.id) : '',
      status: getActiveStatus(user),
      friendship_status: friendship ? friendship.status : 'none',
      is_me: targetId === req.user.id,
      is_verified: Boolean(user.is_verified),
      gender: user.gender
    });
});
app.post('/api/follow/:userId', authLib.requireUser, (req, res) => {
  const targetId = Number(req.params.userId);
  if (targetId === req.user.id) return res.status(400).json({ error: 'cannot_follow_self' });
  const target = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);
  if (!target) return res.status(404).json({ error: 'user_not_found' });
  db.prepare('INSERT OR IGNORE INTO follows (follower_id, followed_id) VALUES (?, ?)').run(req.user.id, targetId);
  res.json({ success: true, following: true });
});
app.post('/api/unfollow/:userId', authLib.requireUser, (req, res) => {
  const targetId = Number(req.params.userId);
  db.prepare('DELETE FROM follows WHERE follower_id = ? AND followed_id = ?').run(req.user.id, targetId);
  res.json({ success: true, following: false });
});
app.get('/api/following', authLib.requireUser, (req, res) => {
  const list = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar_data FROM follows f
    JOIN users u ON u.id = f.followed_id WHERE f.follower_id = ? ORDER BY f.created_at DESC
  `).all(req.user.id);
  res.json(list.map(u => ({ id: u.id, username: u.username, display_name: u.display_name, photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : '' })));
});
app.get('/api/followers', authLib.requireUser, (req, res) => {
  const list = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar_data FROM follows f
    JOIN users u ON u.id = f.follower_id WHERE f.followed_id = ? ORDER BY f.created_at DESC
  `).all(req.user.id);
  res.json(list.map(u => ({ id: u.id, username: u.username, display_name: u.display_name, photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : '' })));
});
app.get('/api/profile-viewers', authLib.requireUser, (req, res) => {
    const viewers = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar_data, MAX(pv.viewed_at) as last_viewed
      FROM profile_views pv JOIN users u ON u.id = pv.viewer_id
      WHERE pv.viewed_id = ? GROUP BY u.id ORDER BY last_viewed DESC LIMIT 30
    `).all(req.user.id);
    res.json(viewers.map(u => ({ id: u.id, username: u.username, display_name: u.display_name, photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : '', last_viewed: u.last_viewed })));
});
app.get('/api/notifications', authLib.requireUser, (req, res) => {
    const notifs = db.prepare(`
      SELECT n.*, u.username, u.display_name, u.avatar_data FROM notifications n
      LEFT JOIN users u ON u.id = n.from_user_id
      WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 30
    `).all(req.user.id);
    res.json(notifs.map(n => ({
      id: n.id, type: n.type, ref_id: n.ref_id, extra_text: n.extra_text, is_read: Boolean(n.is_read), created_at: n.created_at,
      from_user: n.from_user_id ? { id: n.from_user_id, username: n.username, display_name: n.display_name, photo_url: n.avatar_data ? ('/api/avatar/' + n.from_user_id) : '' } : null
    })));
});
app.get('/api/profile-viewers/unseen-count', authLib.requireUser, (req, res) => {
    const row = db.prepare('SELECT COUNT(DISTINCT viewer_id) as c FROM profile_views WHERE viewed_id = ? AND is_seen = 0').get(req.user.id);
    res.json({ count: row.c });
});
app.post('/api/profile-viewers/mark-seen', authLib.requireUser, (req, res) => {
    db.prepare('UPDATE profile_views SET is_seen = 1 WHERE viewed_id = ?').run(req.user.id);
    res.json({ success: true });
});app.get('/api/notifications/unread-count', authLib.requireUser, (req, res) => {
    const row = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id);
    res.json({ count: row.c });
});
app.post('/api/notifications/mark-read', authLib.requireUser, (req, res) => {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    res.json({ success: true });
});app.get('/api/profile/:userId/posts', authLib.requireUser, (req, res) => {
    const targetId = Number(req.params.userId);
    const posts = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar_data,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as liked_by_me
      FROM posts p JOIN users u ON p.user_id = u.id WHERE p.user_id = ? ORDER BY p.created_at DESC LIMIT 30
    `).all(req.user.id, targetId);
    res.json(posts.map(p => ({
      id: p.id, text: p.text, created_at: p.created_at, likes_count: p.likes_count, comments_count: p.comments_count, liked_by_me: Boolean(p.liked_by_me),
      user: { id: p.user_id, username: p.username, display_name: p.display_name, photo_url: p.avatar_data ? ('/api/avatar/' + p.user_id) : '' }
    })));
});app.get('/api/friends/list', authLib.requireUser, (req, res) => {
    const friends = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar_data FROM friendships f
      JOIN users u ON u.id = (CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END)
      WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
    `).all(req.user.id, req.user.id, req.user.id);
    res.json(friends.map(u => ({ id: u.id, username: u.username, display_name: u.display_name, photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : '' })));
});app.get('/api/friends/remove/:targetId', authLib.requireUser, (req, res) => {
    const targetId = Number(req.params.targetId);
    const [uId, fId] = req.user.id < targetId ? [req.user.id, targetId] : [targetId, req.user.id];
    db.prepare('DELETE FROM friendships WHERE user_id = ? AND friend_id = ?').run(uId, fId);
    res.json({ success: true });
});
app.get('/api/friends/requests', authLib.requireUser, (req, res) => {
    const requests = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar_data FROM friendships f
      JOIN users u ON u.id = f.requested_by
      WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'pending' AND f.requested_by != ?
    `).all(req.user.id, req.user.id, req.user.id);
    res.json(requests.map(u => ({ id: u.id, username: u.username, display_name: u.display_name, photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : '' })));
});
app.post('/api/friends/request/:targetId', authLib.requireUser, (req, res) => {
    const targetId = Number(req.params.targetId);
    if (targetId === req.user.id) return res.status(400).json({ error: 'cannot_friend_self' });
    const [uId, fId] = req.user.id < targetId ? [req.user.id, targetId] : [targetId, req.user.id];
    const existing = db.prepare('SELECT * FROM friendships WHERE user_id = ? AND friend_id = ?').get(uId, fId);
    if (existing) return res.json({ status: existing.status });
    db.prepare('INSERT INTO friendships (user_id, friend_id, status, requested_by) VALUES (?, ?, ?, ?)').run(uId, fId, 'pending', req.user.id);
    res.json({ status: 'pending' });
});
app.post('/api/friends/accept/:targetId', authLib.requireUser, (req, res) => {
    const targetId = Number(req.params.targetId);
    const [uId, fId] = req.user.id < targetId ? [req.user.id, targetId] : [targetId, req.user.id];
    db.prepare('UPDATE friendships SET status = ? WHERE user_id = ? AND friend_id = ?').run('admin_pending', uId, fId);
    res.json({ success: true });
});
app.get('/api/friends/status/:targetId', authLib.requireUser, (req, res) => {
    const targetId = Number(req.params.targetId);
    const [uId, fId] = req.user.id < targetId ? [req.user.id, targetId] : [targetId, req.user.id];
    const row = db.prepare('SELECT status, requested_by FROM friendships WHERE user_id = ? AND friend_id = ?').get(uId, fId);
    res.json({ status: row ? row.status : 'none', requested_by: row ? row.requested_by : null });
});
app.get('/api/users/search', authLib.requireUser, (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const users = db.prepare('SELECT id, username, display_name, avatar_data FROM users WHERE (username LIKE ? OR display_name LIKE ?) AND id != ? LIMIT 20').all('%' + q + '%', '%' + q + '%', req.user.id);
    res.json(users.map(u => ({ id: u.id, username: u.username, display_name: u.display_name, photo_url: u.avatar_data ? ('/api/avatar/' + u.id) : '' })));
});app.get('/api/feed', authLib.requireUser, (req, res) => {
    const posts = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar_data,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as liked_by_me
      FROM posts p JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC LIMIT 50
    `).all(req.user.id);
    res.json(posts.map(p => ({
      id: p.id,
      text: p.text,
      image_url: p.image_url,
      created_at: p.created_at,
      likes_count: p.likes_count,
      comments_count: p.comments_count,
      liked_by_me: Boolean(p.liked_by_me),
      user: { id: p.user_id, username: p.username, display_name: p.display_name, photo_url: p.avatar_data ? ('/api/avatar/' + p.user_id) : '' }
    })));
});
app.post('/api/feed/post', authLib.requireUser, (req, res) => {
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: 'empty_text' });
    const result = db.prepare('INSERT INTO posts (user_id, text) VALUES (?, ?)').run(req.user.id, text.trim());
    res.json({ id: result.lastInsertRowid, success: true });
});
app.post('/api/feed/like/:postId', authLib.requireUser, (req, res) => {
    const postId = Number(req.params.postId);
    const existing = db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(postId, req.user.id);
    if (existing) {
      db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(postId, req.user.id);
      res.json({ liked: false });
    } else {
      db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)').run(postId, req.user.id);
      const postOwner = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId);
      if (postOwner && postOwner.user_id !== req.user.id) {
        db.prepare('INSERT INTO notifications (user_id, type, from_user_id, ref_id) VALUES (?, ?, ?, ?)').run(postOwner.user_id, 'post_like', req.user.id, postId);
      }
      res.json({ liked: true });
    }
});
app.post('/api/feed/comment/:postId', authLib.requireUser, (req, res) => {
    const postId = Number(req.params.postId);
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: 'empty_text' });
    const result = db.prepare('INSERT INTO post_comments (post_id, user_id, text) VALUES (?, ?, ?)').run(postId, req.user.id, text.trim());
    const postOwnerC = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId);
    if (postOwnerC && postOwnerC.user_id !== req.user.id) {
      db.prepare('INSERT INTO notifications (user_id, type, from_user_id, ref_id) VALUES (?, ?, ?, ?)').run(postOwnerC.user_id, 'post_comment', req.user.id, postId);
    }
    res.json({ id: result.lastInsertRowid, success: true });
});
app.get('/api/feed/comments/:postId', authLib.requireUser, (req, res) => {
    const postId = Number(req.params.postId);
    const comments = db.prepare(`
      SELECT c.*, u.username, u.display_name FROM post_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? ORDER BY c.created_at ASC
    `).all(postId);
    res.json(comments.map(c => ({
      id: c.id, text: c.text, created_at: c.created_at,
      user: { id: c.user_id, username: c.username, display_name: c.display_name }
    })));
});app.get('/api/admin/pending-friendships', (req, res) => {
    const rows = db.prepare(`
      SELECT f.*, u1.username as user1_name, u1.display_name as user1_display, u2.username as user2_name, u2.display_name as user2_display
      FROM friendships f
      JOIN users u1 ON u1.id = f.user_id
      JOIN users u2 ON u2.id = f.friend_id
      WHERE f.status = 'pending'
      ORDER BY f.created_at DESC
    `).all();
    res.json(rows.map(r => ({
      user_id: r.user_id, friend_id: r.friend_id, requested_by: r.requested_by, created_at: r.created_at,
      user1: { id: r.user_id, name: r.user1_display || r.user1_name },
      user2: { id: r.friend_id, name: r.user2_display || r.user2_name }
    })));
});
app.post('/api/admin/friendship-decision/:userId/:friendId', (req, res) => {
    const userId = Number(req.params.userId);
    const friendId = Number(req.params.friendId);
    const approve = req.body && req.body.approve;
    if (approve) {
      db.prepare('UPDATE friendships SET status = ? WHERE user_id = ? AND friend_id = ?').run('accepted', userId, friendId);
    } else {
      db.prepare('DELETE FROM friendships WHERE user_id = ? AND friend_id = ?').run(userId, friendId);
    }
    res.json({ success: true });
});
app.get('/api/admin/all-messages', (req, res) => {
    const rows = db.prepare(`
      SELECT m.*, u1.username as sender_name, u1.display_name as sender_display, u2.username as receiver_name, u2.display_name as receiver_display
      FROM messages m
      JOIN users u1 ON u1.id = m.sender_id
      JOIN users u2 ON u2.id = m.receiver_id
      ORDER BY m.created_at DESC LIMIT 200
    `).all();
    res.json(rows.map(m => ({
      id: m.id, text: m.text, created_at: m.created_at,
      sender: { id: m.sender_id, name: m.sender_display || m.sender_name },
      receiver: { id: m.receiver_id, name: m.receiver_display || m.receiver_name }
    })));
});app.get('/api/admin/view-user/:id', (req, res) => {
    const u = db.prepare('SELECT id, username, display_name, active_frame, active_stone, owned_items, bottle_type, birthdate, league_tier, daily_league_score, daily_league_date, total_kisses, points, price_stat, harem_price_stat, gestures_sent, is_vip FROM users WHERE id = ?').get(Number(req.params.id));
    res.json(u || { error: 'not_found' });
});
app.get('/api/admin/view-friendships', (req, res) => {
    const rows = db.prepare('SELECT * FROM friendships').all();
    res.json(rows);
});
app.get('/api/admin/force-friend/:id1/:id2', (req, res) => {
    const id1 = Number(req.params.id1);
    const id2 = Number(req.params.id2);
    db.prepare('DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').run(id1, id2, id2, id1);
    db.prepare("INSERT INTO friendships (user_id, friend_id, status, requested_by, expires_at) VALUES (?, ?, 'accepted', ?, datetime('now', '+30 days'))").run(id1, id2, id1);
    res.send('Dostluq elave edildi: ' + id1 + ' <-> ' + id2);
});
app.post('/api/admin/users/:id/coins', authLib.requireAdmin, (req, res) => {

    const { amount, reason } = req.body || {};
    if (typeof amount !== 'number' || isNaN(amount))
        return res.status(400).json({ error: 'amount_required' });
    game.awardCoins(
        Number(req.params.id),
        amount,
        reason || 'admin_grant',
        req.admin.id
    );

    res.json(
        db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id)
    );

});

app.post('/api/admin/users/:id/crystals', authLib.requireAdmin, (req, res) => {
    const { amount, reason } = req.body || {};
    if (typeof amount !== 'number')
        return res.status(400).json({ error: 'amount_required' });
    game.awardCrystals(
        Number(req.params.id),
        amount,
        reason || 'admin_grant',
        req.admin.id
    );
    res.json(
        db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id)
    );
});

app.post('/api/admin/users/:id/kisses', authLib.requireAdmin, (req, res) => {
    const amount = Number(req.body.amount || 0);
    db.prepare('UPDATE users SET total_kisses = total_kisses + ? WHERE id = ?').run(amount, req.params.id);
    res.json({ success: true });
});
app.post('/api/admin/users/:id/gestures', authLib.requireAdmin, (req, res) => {
    const amount = Number(req.body.amount || 0);
    db.prepare('UPDATE users SET gestures_sent = gestures_sent + ? WHERE id = ?').run(amount, req.params.id);
    res.json({ success: true });
});
app.post('/api/admin/users/:id/dj-score', authLib.requireAdmin, (req, res) => {
    const amount = Number(req.body.amount || 0);
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(amount, req.params.id);
    res.json({ success: true });
});
app.post('/api/admin/users/:id/price', authLib.requireAdmin, (req, res) => {
    const amount = Number(req.body.amount || 0);
    db.prepare('UPDATE users SET price_stat = price_stat + ? WHERE id = ?').run(amount, req.params.id);
    res.json({ success: true });
});
app.post('/api/admin/users/:id/harem-price', authLib.requireAdmin, (req, res) => {
    const amount = Number(req.body.amount || 0);
    db.prepare('UPDATE users SET harem_price_stat = harem_price_stat + ? WHERE id = ?').run(amount, req.params.id);
    res.json({ success: true });
});app.post('/api/admin/users/:id/kisses-reset', authLib.requireAdmin, (req, res) => {
    db.prepare('UPDATE users SET total_kisses = 0 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});
app.get('/api/music-proxy', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url || !url.startsWith('https://music-cdn-wp.ciliz.com/')) {
            return res.status(400).send('Invalid url');
        }
        const upstream = await fetch(url, {
            headers: {
                'Referer': 'https://ciliz.com/',
                'Origin': 'https://ciliz.com',
                'Range': req.headers.range || ''
            }
        });
        res.status(upstream.status);
        upstream.headers.forEach((value, key) => {
            if (['content-type', 'content-length', 'content-range', 'accept-ranges'].includes(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });
        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.send(buffer);
    } catch (error) {
        console.error('music proxy error:', error);
        res.status(500).send('proxy error');
    }
});
app.post('/api/music/send', authLib.requireUser, (req, res) => {
    const { title, url } = req.body || {};
    if (!title) return res.status(400).json({ error: 'no_title' });
    const ws = userIdToWs.get(req.user.id);
    if (!ws || !ws.gameRoom || !ws.gamePlayer) return res.status(400).json({ error: 'not_in_game' });
    const musicMsg = {
      type: 'game_chat',
      text: '?? ' + title + (url ? (' - ' + url) : ''),
      user: { id: ws.gamePlayer.id, name: ws.gamePlayer.name, male: ws.gamePlayer.male, vip: ws.gamePlayer.vip, pass_premium: ws.gamePlayer.pass_premium, top: ws.gamePlayer.top },
      timestamp: Date.now()
    };
    broadcastToRoom(ws.gameRoom, null, musicMsg);
    console.log('WS: mahni gonderildi - ' + ws.gamePlayer.name + ' - ' + title);
    res.json({ success: true });
});app.post('/api/admin/pass/start-season', authLib.requireAdmin, (req, res) => {
    const now = Date.now();
    db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run('season_start_ms', String(now), String(now));
    res.json({ success: true, season_start_ms: now });
});
app.post('/api/admin/pass/end-season', authLib.requireAdmin, (req, res) => {
    const now = Date.now();
    const seasonLengthMs = 35 * 24 * 60 * 60 * 1000;
    const pastStart = now - seasonLengthMs;
    db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run('season_start_ms', String(pastStart), String(pastStart));
    res.json({ success: true, season_start_ms: pastStart });
});
app.post('/api/admin/users/:id/grant-pass', authLib.requireAdmin, (req, res) => {
    const seasonStartRow = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('season_start_ms');
    const seasonStart = seasonStartRow ? Number(seasonStartRow.value) : Date.now();
    db.prepare('INSERT INTO pass_purchases (user_id, season_start_ms) VALUES (?, ?) ON CONFLICT(user_id, season_start_ms) DO NOTHING').run(Number(req.params.id), seasonStart);
    res.json({ success: true });
});app.post('/api/admin/users/:id/vip', authLib.requireAdmin, (req, res) => {

    const { until } = req.body || {};

    game.setVip(
        Number(req.params.id),
        until || null,
        req.admin.id
    );

    res.json(
        db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id)
    );

});

app.post('/api/admin/users/:id/ban', authLib.requireAdmin, (req, res) => {
    const { banned, hours } = req.body || {};
    let banUntil = null;
    if (banned && hours && Number(hours) > 0) {
        const d = new Date();
        d.setHours(d.getHours() + Number(hours));
        banUntil = d.toISOString();
    }
    db.prepare(
        'UPDATE users SET is_banned=?, ban_until=? WHERE id=?'
    ).run(banned ? 1 : 0, banUntil, req.params.id);
    if (banned) {
      const targetWsBan = userIdToWs.get(Number(req.params.id));
      if (targetWsBan) {
        targetWsBan.send(encodeMessage({ type: 'error', error: 'banned', packet: 1 }));
        targetWsBan.close();
      }
    }
    res.json(
        db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id)
    );
});

app.post('/api/admin/users/:id/change-id', authLib.requireAdmin, (req, res) => {
    const oldId = Number(req.params.id);
    const newId = Number(req.body.new_id);
    if (!newId || newId === oldId) { res.status(400).json({ error: 'yenlis yeni ID' }); return; }
    const existing = db.prepare('SELECT id FROM users WHERE id=?').get(newId);
    if (existing) { res.status(400).json({ error: 'Bu ID artiq istifade olunur' }); return; }
    const oldUser = db.prepare('SELECT id FROM users WHERE id=?').get(oldId);
    if (!oldUser) { res.status(404).json({ error: 'istifadeci tapilmadi' }); return; }
    const tx = db.transaction(() => {
        db.prepare('UPDATE users SET id=? WHERE id=?').run(newId, oldId);
        db.prepare('UPDATE friendships SET user_id=? WHERE user_id=?').run(newId, oldId);
        db.prepare('UPDATE friendships SET friend_id=? WHERE friend_id=?').run(newId, oldId);
        db.prepare('UPDATE friendships SET requested_by=? WHERE requested_by=?').run(newId, oldId);
        db.prepare('UPDATE played_together SET user_id=? WHERE user_id=?').run(newId, oldId);
        db.prepare('UPDATE played_together SET fellow_id=? WHERE fellow_id=?').run(newId, oldId);
        db.prepare('UPDATE gift_achievement_progress SET user_id=? WHERE user_id=?').run(newId, oldId);
        db.prepare('UPDATE music_favorites SET user_id=? WHERE user_id=?').run(newId, oldId);
    });
    try {
        tx();
        res.json({ message: 'ID ugurla deyisdirildi: ' + oldId + ' -> ' + newId });
    } catch (error) {
        console.error('change-id error:', error);
        res.status(500).json({ error: 'ID deyisdirme xetasi: ' + error.message });
    }
});app.get('/api/admin/users/:id/transactions', authLib.requireAdmin, (req, res) => {

    res.json(
        db.prepare(`
            SELECT *
            FROM transactions
            WHERE user_id=?
            ORDER BY id DESC
            LIMIT 100
        `).all(req.params.id)
    );

});


// =====================
// SOCKET.IO
// =====================

io.on('connection', (socket) => {

    let currentRoomId = null;
    let currentPlayer = null;

    socket.on('join_room', ({ roomId, telegramId, username, displayName, avatarUrl }) => {

        if (!roomId || !telegramId) {
            socket.emit('error_message', {
                error: 'roomId_and_telegramId_required'
            });
            return;
        }

        const user = game.getOrCreateUser({
            telegramId,
            username,
            displayName,
            avatarUrl
        });

        if (user.is_banned) {
            socket.emit('error_message', { error: 'banned' });
            return;
        }

        currentPlayer = {
            userId: user.id,
            telegramId: user.telegram_id,
            displayName: user.display_name || username || 'Qonaq',
            avatarUrl: user.avatar_url || '',
            isVip: !!user.is_vip
        };

        const result = game.addPlayer(roomId, socket.id, currentPlayer);

        if (!result.ok) {
            socket.emit('error_message', { error: result.error });
            return;
        }

        currentRoomId = roomId;

        socket.join(roomId);

        io.to(roomId).emit(
            'room_update',
            game.roomSnapshot(result.room)
        );

        socket.emit('joined', {
            userId: user.id,
            points: user.points,
            coins: user.coins
        });

    });

    socket.on('spin_bottle', () => {

        if (!currentRoomId) return;

        const result = game.spin(currentRoomId, socket.id);

        if (!result.ok) {
            socket.emit('error_message', { error: result.error });
            return;
        }

        io.to(currentRoomId).emit('bottle_spinning', {
            spinnerId: result.spinnerId,
            targetId: result.targetId
        });

        setTimeout(() => {

            game.endSpin(currentRoomId);

            io.to(currentRoomId).emit('spin_result', {
                spinnerId: result.spinnerId,
                targetId: result.targetId
            });

        }, 3000);

    });

    socket.on('send_gift', ({ targetId, giftId }) => {

        if (!currentRoomId || !currentPlayer) return;

        io.to(currentRoomId).emit('gift_received', {
            fromId: currentPlayer.userId,
            fromName: currentPlayer.displayName,
            targetId,
            giftId
        });

    });

    socket.on('chat_message', ({ text }) => {

        if (!currentRoomId || !currentPlayer) return;

        const trimmed = String(text || '').slice(0, 300).trim();

        if (!trimmed) return;

        io.to(currentRoomId).emit('chat_message', {
            userId: currentPlayer.userId,
            name: currentPlayer.displayName,
            text: trimmed,
            ts: Date.now()
        });

    });

    socket.on('disconnect', () => {

        if (!currentRoomId) return;

        game.removePlayer(currentRoomId, socket.id);

        const room = game.getOrCreateRoom(currentRoomId);

        io.to(currentRoomId).emit(
            'room_update',
            game.roomSnapshot(room)
        );

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('=====================================');
    console.log('Bu skript ureyimsen.com saytina mexsusdur.');
    console.log('Aylik icareye verilib. Icazesiz istifade qadagandir.');
    console.log('=====================================');
    console.log(`Ô£à Server started on port ${PORT}`);
    console.log(`­şöæ Login Page: http://localhost:${PORT}/`);
    console.log(`­şÄ« Game Page:  http://localhost:${PORT}/game`);
    console.log(`­şæñ Admin Panel: http://localhost:${PORT}/admin`);
});
app.post('/api/telegram-login', async (req, res) => {
    try {
        const dataFull = req.body || {};
        const { device_id } = dataFull;
        const data = Object.assign({}, dataFull); delete data.device_id;
        const { hash, id, first_name, last_name, username, photo_url, auth_date } = data;
        if (!hash || !id) return res.status(400).json({ error: 'invalid_telegram_data' });
        if (device_id) {
          const bannedDevT = db.prepare('SELECT * FROM banned_devices WHERE device_id = ?').get(device_id);
          if (bannedDevT) return res.status(403).json({ error: 'device_banned' });
        }
        const crypto = require('crypto');
        const BOT_TOKEN = '8904330913:AAEsBE5MGsPL9kETTlo_chNpcQJIwTlhwmM';
        const checkFields = Object.keys(data).filter(k => k !== 'hash').sort();
        const checkString = checkFields.map(k => k + '=' + data[k]).join('\n');
        const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
        const computedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
        if (computedHash !== hash) return res.status(401).json({ error: 'invalid_telegram_hash' });
        if (auth_date && (Date.now() / 1000 - auth_date) > 86400) return res.status(401).json({ error: 'telegram_data_expired' });
        const telegramId = String(id);
        const displayName = [first_name, last_name].filter(Boolean).join(' ') || username || ('tg_' + telegramId);
        let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
        if (user && user.is_banned) {
          if (user.ban_until && new Date(user.ban_until) <= new Date()) {
            db.prepare('UPDATE users SET is_banned=0, ban_until=NULL WHERE id=?').run(user.id);
          } else {
            return res.status(403).json({ error: 'user_banned', ban_until: user.ban_until });
          }
        }
        if (!user) {
            if (device_id) {
              const existingDevT = db.prepare('SELECT user_id FROM device_bindings WHERE device_id = ?').get(device_id);
              if (existingDevT) return res.status(403).json({ error: 'device_already_used' });
            }
            const info = db.prepare(
                'INSERT INTO users (username, display_name, avatar_data, telegram_id) VALUES (?, ?, ?, ?)'
            ).run('tg_' + telegramId, displayName, photo_url || null, telegramId);
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
            if (device_id) { try { db.prepare('INSERT INTO device_bindings (device_id, user_id, ip_address) VALUES (?, ?, ?)').run(device_id, user.id, getClientIp(req)); } catch (e) {} }
            console.log('WS: Telegram ile yeni istifadeci qeydiyyati - ' + displayName);
        } else {
            console.log('WS: Telegram ile giris - ' + displayName);
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ message: 'login_successful', token, username: user.username });
    } catch (error) {
        console.error('Telegram login error:', error);
        res.status(401).json({ error: 'invalid_telegram_data' });
    }
});
app.post('/api/facebook-login', async (req, res) => {
    try {
        const { access_token, device_id } = req.body || {};
        if (!access_token) return res.status(400).json({ error: 'access_token_required' });
        if (device_id) {
          const bannedDevF = db.prepare('SELECT * FROM banned_devices WHERE device_id = ?').get(device_id);
          if (bannedDevF) return res.status(403).json({ error: 'device_banned' });
        }
        const fbRes = await fetch('https://graph.facebook.com/me?fields=id,name,email,picture.width(200).height(200)&access_token=' + encodeURIComponent(access_token));
        const fbData = await fbRes.json();
        if (!fbData.id) return res.status(401).json({ error: 'invalid_facebook_token' });
        const facebookId = fbData.id;
        const email = fbData.email || ('fb_' + facebookId);
        const name = fbData.name;
        const picture = fbData.picture && fbData.picture.data && fbData.picture.data.url;
        let user = db.prepare('SELECT * FROM users WHERE facebook_id = ?').get(facebookId);
        if (!user) {
            if (device_id) {
              const existingDevF = db.prepare('SELECT user_id FROM device_bindings WHERE device_id = ?').get(device_id);
              if (existingDevF) return res.status(403).json({ error: 'device_already_used' });
            }
            const info = db.prepare(
                'INSERT INTO users (username, display_name, avatar_data, facebook_id) VALUES (?, ?, ?, ?)'
            ).run(email, name || email, picture || null, facebookId);
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
            if (device_id) { try { db.prepare('INSERT INTO device_bindings (device_id, user_id, ip_address) VALUES (?, ?, ?)').run(device_id, user.id, getClientIp(req)); } catch (e) {} }
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
