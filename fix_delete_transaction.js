const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const deleteTx = db.transaction(() => {\r\n            tablesWithUserId.forEach(table => {\r\n                try {\r\n                    const cols = db.prepare('PRAGMA table_info(' + table + ')').all().map(c => c.name);\r\n                    ['user_id', 'sender_id', 'receiver_id', 'target_id', 'viewer_id', 'viewed_id', 'friend_id', 'follower_id', 'followed_id', 'fellow_id', 'from_user_id', 'new_owner_id', 'old_owner_id'].forEach(col => {\r\n                        if (cols.includes(col)) {\r\n                            db.prepare('DELETE FROM ' + table + ' WHERE ' + col + ' = ?').run(targetId);\r\n                        }\r\n                    });\r\n                } catch (e) {}\r\n            });\r\n            db.prepare('DELETE FROM users WHERE id = ?').run(targetId);\r\n        });\r\n        deleteTx();";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "tablesWithUserId.forEach(table => {\r\n            try {\r\n                const cols = db.prepare('PRAGMA table_info(' + table + ')').all().map(c => c.name);\r\n                ['user_id', 'sender_id', 'receiver_id', 'target_id', 'viewer_id', 'viewed_id', 'friend_id', 'follower_id', 'followed_id', 'fellow_id', 'from_user_id', 'new_owner_id', 'old_owner_id'].forEach(col => {\r\n                    if (cols.includes(col)) {\r\n                        db.prepare('DELETE FROM ' + table + ' WHERE ' + col + ' = ?').run(targetId);\r\n                    }\r\n                });\r\n            } catch (e) {}\r\n        });\r\n        db.prepare('DELETE FROM users WHERE id = ?').run(targetId);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
