// auth.js � Admin panel v? oyun�ular ���n login/JWT autentifikasiyas�

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-DEYISDIRIN-production-da';

// ---- Admin ----

function createAdmin(username, password) {
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
}

function verifyAdmin(username, password) {
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin) return null;
  const ok = bcrypt.compareSync(password, admin.password_hash);
  return ok ? admin : null;
}

function issueToken(admin) {
  return jwt.sign({ id: admin.id, username: admin.username, role: 'admin' }, JWT_SECRET, {
    expiresIn: '12h',
  });
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no_token' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

// ---- Oyun�ular ----

function registerUser(username, password, displayName, gender, birthdate) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return { error: 'username_taken' };
  const hash = bcrypt.hashSync(password, 10);
  let newId;
  do { newId = 1000 + Math.floor(Math.random() * 9000); } while (db.prepare('SELECT id FROM users WHERE id = ?').get(newId));
  db.prepare(
    'INSERT INTO users (id, username, password_hash, display_name, gender, birthdate) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(newId, username, hash, displayName || username, gender || null, birthdate || null);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);return { user };
}

function verifyUser(username, password) {
  const user = /^[0-9]+$/.test(username) ? db.prepare('SELECT * FROM users WHERE id = ?').get(Number(username)) : db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  console.log('LOGIN-DEBUG: username=' + username + ' user_found=' + (user ? 'BELI' : 'YOX'));
  if (!user || !user.password_hash) { console.log('LOGIN-DEBUG: no_password_hash=' + (user ? !user.password_hash : 'no_user')); return null; }
  if (user.is_banned) {
    if (user.ban_until && new Date(user.ban_until) <= new Date()) {
      db.prepare('UPDATE users SET is_banned=0, ban_until=NULL WHERE id=?').run(user.id);
    } else {
      const err = new Error('user_banned');
      err.code = 'BANNED';
      err.banUntil = user.ban_until;
      throw err;
    }
  }
  const ok = bcrypt.compareSync(password, user.password_hash);
  console.log('LOGIN-DEBUG: password_match=' + ok);
  return ok ? user : null;
}

function issueUserToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: 'user' }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

function requireUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no_token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = {
  createAdmin, verifyAdmin, issueToken, requireAdmin,
  registerUser, verifyUser, issueUserToken, requireUser,
  JWT_SECRET
};
