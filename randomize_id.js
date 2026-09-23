const fs = require("fs");
const path = "auth.js";
let c = fs.readFileSync(path, "utf8");
const old = "function registerUser(username, password, displayName, gender, birthdate) {\n  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);\n  if (existing) return { error: 'username_taken' };\n  const hash = bcrypt.hashSync(password, 10);\n  const info = db.prepare(\n    'INSERT INTO users (username, password_hash, display_name, gender, birthdate) VALUES (?, ?, ?, ?, ?)'\n  ).run(username, hash, displayName || username, gender || null, birthdate || null);\n  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);return { user };\n}";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "function registerUser(username, password, displayName, gender, birthdate) {\n  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);\n  if (existing) return { error: 'username_taken' };\n  const hash = bcrypt.hashSync(password, 10);\n  let newId;\n  do { newId = 1000 + Math.floor(Math.random() * 9000); } while (db.prepare('SELECT id FROM users WHERE id = ?').get(newId));\n  db.prepare(\n    'INSERT INTO users (id, username, password_hash, display_name, gender, birthdate) VALUES (?, ?, ?, ?, ?, ?)'\n  ).run(newId, username, hash, displayName || username, gender || null, birthdate || null);\n  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);return { user };\n}";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
