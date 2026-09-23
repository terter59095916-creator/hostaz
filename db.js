// db.js ù SQLite veril?nl?r bazas² qura¦d²rmas²
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
const db = new DatabaseSync(path.join(dbDir, 'bottle.db'));
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id TEXT UNIQUE,
  username TEXT UNIQUE,
  password_hash TEXT,
  display_name TEXT,
  avatar_url TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  is_vip INTEGER NOT NULL DEFAULT 0,
  vip_until TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  is_banned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  admin_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS harem_ownership (
  target_id INTEGER PRIMARY KEY,
  owner_id INTEGER,
  price INTEGER NOT NULL DEFAULT 10,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS harem_inbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  new_owner_id INTEGER NOT NULL,
  old_owner_id INTEGER,
  price INTEGER NOT NULL,
  ts INTEGER NOT NULL,
  delivered INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS youtube_cache (
  song_key TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  duration INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS played_together (
  user_id INTEGER NOT NULL,
  fellow_id INTEGER NOT NULL,
  last_game_id INTEGER,
  last_played_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, fellow_id)
);
CREATE TABLE IF NOT EXISTS gift_achievement_progress (
  user_id INTEGER NOT NULL,
  gift_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_level INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, gift_type)
);
CREATE TABLE IF NOT EXISTS friendships (
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, friend_id)
);
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

  CREATE TABLE IF NOT EXISTS pass_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    level INTEGER NOT NULL,
    line TEXT NOT NULL,
    season_start_ms INTEGER NOT NULL,
    claimed_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, level, line, season_start_ms)
  );
`);

// M÷vcud bazada (?vv?lki versiyada yarad²l²bsa) yeni s³tunlar² ?lav? et
try { db.exec('ALTER TABLE users ADD COLUMN daily_bonus_streak INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN username TEXT UNIQUE'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN gender TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN birthdate TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN crystals INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN game_registered INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN total_kisses INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN pass_score INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN free_season_start_ms INTEGER'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN avatar_data TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN tokens INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN gestures_sent INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN price_stat INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN harem_price_stat INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN user_status TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN is_moderator INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN muted_until TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN gift_banned_until TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN kicked_until TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN daily_active_seconds INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN daily_active_date TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN claimed_hour_milestones TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN daily_message_count INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN daily_message_date TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN claimed_msg_rank_date TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN daily_music_count INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN daily_music_date TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN claimed_music_rank_date TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN claimed_music_hour_milestones TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN owned_items TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN active_frame TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN active_stone TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN achievements TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN achievement_counts TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN daily_league_score INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN daily_league_date TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN bottle_type TEXT'); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN league_tier TEXT NOT NULL DEFAULT 'bronze'"); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN google_id TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN ban_until TEXT'); } catch (e) {}
db.exec(`CREATE TABLE IF NOT EXISTS music_favorites (user_id INTEGER NOT NULL, folder TEXT NOT NULL, song_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (user_id, folder, song_id))`);
try { db.exec('ALTER TABLE friendships ADD COLUMN expires_at TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE profile_views ADD COLUMN is_seen INTEGER DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE notifications ADD COLUMN extra_text TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN live_balance INTEGER DEFAULT 0'); } catch (e) {}
try {
  db.exec(`CREATE TABLE IF NOT EXISTS shorts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    video_data TEXT,
    caption TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    views_count INTEGER DEFAULT 0
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS short_likes (
    short_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (short_id, user_id)
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS short_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
} catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN friendship_pass_expires TEXT'); console.log('DB-MIGRATION: friendship_pass_expires eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN kiss_fire_count INTEGER DEFAULT 0'); console.log('DB-MIGRATION: kiss_fire_count eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN age INTEGER'); console.log('DB-MIGRATION: age eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN gender TEXT'); console.log('DB-MIGRATION: gender eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN facebook_id TEXT'); console.log('DB-MIGRATION: facebook_id eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN telegram_id TEXT'); console.log('DB-MIGRATION: telegram_id eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN live_tokens INTEGER DEFAULT 0'); console.log('DB-MIGRATION: live_tokens eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN gift_level_score INTEGER DEFAULT 0'); console.log('DB-MIGRATION: gift_level_score eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try {
  db.exec('CREATE TABLE IF NOT EXISTS device_bindings (device_id TEXT PRIMARY KEY, user_id INTEGER, ip_address TEXT, bound_at TEXT DEFAULT CURRENT_TIMESTAMP)');
  console.log('DB-MIGRATION: device_bindings cedveli hazirdir');
try {
  db.exec('CREATE TABLE IF NOT EXISTS banned_devices (device_id TEXT PRIMARY KEY, ip_address TEXT, banned_at TEXT DEFAULT CURRENT_TIMESTAMP, reason TEXT)');
  console.log('DB-MIGRATION: banned_devices cedveli hazirdir');
try { db.exec('ALTER TABLE users ADD COLUMN kicked_from_game_id INTEGER'); console.log('DB-MIGRATION: kicked_from_game_id eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN user_status_set_at TEXT'); console.log('DB-MIGRATION: user_status_set_at eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0'); console.log('DB-MIGRATION: is_verified eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN external_id TEXT'); db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_external_id ON users(external_id)'); console.log('DB-MIGRATION: external_id eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN daily_kiss_league_points INTEGER DEFAULT 0'); console.log('DB-MIGRATION: daily_kiss_league_points eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN daily_kiss_league_limit INTEGER DEFAULT 20'); console.log('DB-MIGRATION: daily_kiss_league_limit eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN daily_kiss_limit_date TEXT'); console.log('DB-MIGRATION: daily_kiss_limit_date eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
} catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
} catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try {
  db.exec('CREATE TABLE IF NOT EXISTS visited_rooms (user_id INTEGER NOT NULL, room_id INTEGER NOT NULL, last_visited_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, room_id))');
  console.log('DB-MIGRATION: visited_rooms cedveli hazirdir');
} catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try {
  db.exec(`CREATE TABLE IF NOT EXISTS follows (
    follower_id INTEGER NOT NULL,
    followed_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followed_id)
  )`);
  console.log('DB-MIGRATION: follows cedveli hazirdir');
} catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE friendships ADD COLUMN expires_at TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE profile_views ADD COLUMN is_seen INTEGER DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE notifications ADD COLUMN extra_text TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN live_balance INTEGER DEFAULT 0'); } catch (e) {}
try {
  db.exec(`CREATE TABLE IF NOT EXISTS shorts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    video_data TEXT,
    caption TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    views_count INTEGER DEFAULT 0
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS short_likes (
    short_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (short_id, user_id)
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS short_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
} catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN user_status TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE friendships ADD COLUMN expires_at TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE profile_views ADD COLUMN is_seen INTEGER DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE notifications ADD COLUMN extra_text TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN live_balance INTEGER DEFAULT 0'); } catch (e) {}
try {
  db.exec(`CREATE TABLE IF NOT EXISTS shorts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    video_data TEXT,
    caption TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    views_count INTEGER DEFAULT 0
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS short_likes (
    short_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (short_id, user_id)
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS short_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
} catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN friendship_pass_expires TEXT'); console.log('DB-MIGRATION: friendship_pass_expires eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN kiss_fire_count INTEGER DEFAULT 0'); console.log('DB-MIGRATION: kiss_fire_count eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN age INTEGER'); console.log('DB-MIGRATION: age eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN gender TEXT'); console.log('DB-MIGRATION: gender eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN facebook_id TEXT'); console.log('DB-MIGRATION: facebook_id eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE users ADD COLUMN telegram_id TEXT'); console.log('DB-MIGRATION: telegram_id eklendi'); } catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try {
  db.exec('CREATE TABLE IF NOT EXISTS visited_rooms (user_id INTEGER NOT NULL, room_id INTEGER NOT NULL, last_visited_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, room_id))');
  console.log('DB-MIGRATION: visited_rooms cedveli hazirdir');
} catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try {
  db.exec(`CREATE TABLE IF NOT EXISTS follows (
    follower_id INTEGER NOT NULL,
    followed_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followed_id)
  )`);
  console.log('DB-MIGRATION: follows cedveli hazirdir');
} catch (e) { console.log('DB-MIGRATION-XETA: ' + e.message); }
try { db.exec('ALTER TABLE friendships ADD COLUMN expires_at TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE profile_views ADD COLUMN is_seen INTEGER DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE notifications ADD COLUMN extra_text TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN live_balance INTEGER DEFAULT 0'); } catch (e) {}
try {
  db.exec(`CREATE TABLE IF NOT EXISTS shorts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    video_data TEXT,
    caption TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    views_count INTEGER DEFAULT 0
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS short_likes (
    short_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (short_id, user_id)
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS short_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
} catch (e) {}
try {
  db.exec(`CREATE TABLE IF NOT EXISTS pass_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    season_start_ms INTEGER NOT NULL,
    purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, season_start_ms)
  )`);
try {
  db.exec(`CREATE TABLE IF NOT EXISTS pass_level_rewards (
    level INTEGER PRIMARY KEY,
    free_gold INTEGER NOT NULL,
    paid_gold INTEGER NOT NULL
  )`);
  const rewardCount = db.prepare('SELECT COUNT(*) as c FROM pass_level_rewards').get().c;
  if (rewardCount === 0) {
    const insertReward = db.prepare('INSERT INTO pass_level_rewards (level, free_gold, paid_gold) VALUES (?, ?, ?)');
    for (let i = 0; i < 35; i++) {
      const base = (i + 1) % 7 === 0 ? (10 + i * 5) * 3 : 10 + i * 5;
      insertReward.run(i, base, base * 2);
    }
  }
} catch (e) {}
try {
  db.exec(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    text TEXT,
    image_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS post_likes (
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, user_id)
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS post_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS profile_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    viewer_id INTEGER NOT NULL,
    viewed_id INTEGER NOT NULL,
    viewed_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    from_user_id INTEGER,
    ref_id INTEGER,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);  db.exec(`CREATE TABLE IF NOT EXISTS photo_reactions (
    photo_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reaction TEXT NOT NULL,
    PRIMARY KEY (photo_id, user_id)
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS photo_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
} catch (e) {}
} catch (e) {}
try {
  db.exec(`CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);
} catch (e) {}

module.exports = db;
