const db = require("./db.js");
const users = db.prepare("SELECT id, username, display_name, created_at FROM users WHERE created_at >= datetime('now', '-8 hours') ORDER BY created_at DESC").all();
users.forEach(u => {
  const binding = db.prepare("SELECT device_id, ip_address FROM device_bindings WHERE user_id = ?").get(u.id);
  console.log(u.id + " | " + (u.display_name || u.username) + " | " + u.created_at + " | cihaz: " + (binding ? binding.ip_address : "YOXDUR (bypass?)"));
});
