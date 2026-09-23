// game.js — Otaqlar və "şüşə fırlatma" oyun məntiqi
// Otaqlar yaddaşda (in-memory) saxlanılır, çünki müvəqqətidir (server yenidən başlayanda sıfırlanır).
// Xallar isə db.js vasitəsilə daimi (SQLite) saxlanılır.

const db = require('./db');

// roomId -> { players: Map(socketId -> playerInfo), spinning: bool }
const rooms = new Map();

const MAX_PLAYERS_PER_ROOM = 14; // 12+ tələbinə uyğun, bir az ehtiyat yerlə
const POINTS_PER_SPIN = 5; // hər fırlanmaya görə verilən xal (istəyə görə dəyişin)

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { players: new Map(), spinning: false });
  }
  return rooms.get(roomId);
}

function roomSnapshot(room) {
  return {
    players: Array.from(room.players.values()).map(p => ({
      id: p.userId,
      name: p.displayName,
      avatar: p.avatarUrl,
      isVip: !!p.isVip,
    })),
    spinning: room.spinning,
  };
}

function addPlayer(roomId, socketId, playerInfo) {
  const room = getOrCreateRoom(roomId);
  if (room.players.size >= MAX_PLAYERS_PER_ROOM) {
    return { ok: false, error: 'room_full' };
  }
  room.players.set(socketId, playerInfo);
  return { ok: true, room };
}

function removePlayer(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.players.delete(socketId);
  if (room.players.size === 0) {
    rooms.delete(roomId);
  }
}

function findRoomBySocket(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.players.has(socketId)) return roomId;
  }
  return null;
}

// Şüşəni fırlat: təsadüfi bir oyunçu seç (fırladan özü xaric)
function spin(roomId, spinnerSocketId) {
  const room = rooms.get(roomId);
  if (!room) return { ok: false, error: 'room_not_found' };
  if (room.spinning) return { ok: false, error: 'already_spinning' };

  const spinner = room.players.get(spinnerSocketId);
  if (!spinner) return { ok: false, error: 'not_in_room' };

  const others = Array.from(room.players.entries()).filter(
    ([sid]) => sid !== spinnerSocketId
  );
  if (others.length === 0) return { ok: false, error: 'not_enough_players' };

  const [targetSocketId, target] = others[Math.floor(Math.random() * others.length)];

  room.spinning = true;
  // Xal ver (fırladan istifadəçiyə)
  awardPoints(spinner.userId, POINTS_PER_SPIN, 'spin_reward');

  return {
    ok: true,
    spinnerId: spinner.userId,
    targetId: target.userId,
    targetSocketId,
  };
}

function endSpin(roomId) {
  const room = rooms.get(roomId);
  if (room) room.spinning = false;
}

// ---- Xal / VIP / Coin idarəetməsi (SQLite ilə daimi) ----

function getOrCreateUser({ telegramId, username, displayName, avatarUrl }) {
  let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
  if (!user) {
    const info = db.prepare(
      `INSERT INTO users (telegram_id, username, display_name, avatar_url) VALUES (?, ?, ?, ?)`
    ).run(telegramId, username || '', displayName || '', avatarUrl || '');
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  }
  return user;
}

function awardPoints(userId, amount, reason, adminId = null) {
  db.prepare('UPDATE users SET points = points + ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(amount, userId);
  db.prepare(
    `INSERT INTO transactions (user_id, type, amount, reason, admin_id) VALUES (?, 'points', ?, ?, ?)`
  ).run(userId, amount, reason, adminId);
}

function awardCoins(userId, amount, reason, adminId = null) {
  db.prepare('UPDATE users SET coins = coins + ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(amount, userId);
  db.prepare(
    `INSERT INTO transactions (user_id, type, amount, reason, admin_id) VALUES (?, 'coins', ?, ?, ?)`
  ).run(userId, amount, reason, adminId);
}

function awardCrystals(userId, amount, reason, adminId = null) {
  db.prepare('UPDATE users SET crystals = crystals + ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(amount, userId);
  db.prepare(
    `INSERT INTO transactions (user_id, type, amount, reason, admin_id) VALUES (?, 'crystals', ?, ?, ?)`
  ).run(userId, amount, reason, adminId);
}

function setVip(userId, until /* ISO tarix string, ya da null = ləğv et */, adminId = null) {
  db.prepare('UPDATE users SET is_vip = ?, vip_until = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(until ? 1 : 0, until, userId);
}

function getLeaderboard(limit = 50) {
  return db.prepare(
    'SELECT id, telegram_id, username, display_name, total_kisses, points, harem_price_stat AS price_stat, price_stat AS harem_price_stat, gestures_sent FROM users ORDER BY total_kisses DESC LIMIT ?'
  ).all(limit);
}

module.exports = {
  getOrCreateRoom,
  roomSnapshot,
  addPlayer,
  removePlayer,
  findRoomBySocket,
  spin,
  endSpin,
  getOrCreateUser,
  awardPoints,
  awardCoins,
  awardCrystals,
  setVip,
  getLeaderboard,
};
