const fs = require("fs");
const path = "auth.js";
let c = fs.readFileSync(path, "utf8");
const old = "function registerUser(username, password, displayName, gender, birthdate) {\r\n  const existing = db.prepare(\x27SELECT id FROM users WHERE username = ?\x27).get(username);\r\n  if (existing) return { error: \x27username_taken\x27 };\r\n  const hash = bcrypt.hashSync(password, 10);\r\n  const info = db.prepare(\r\n    \x27INSERT INTO users (username, password_hash, display_name, gender, birthdate) VALUES (?, ?, ?, ?, ?)\x27\r\n  ).run(username, hash, displayName || username, gender || null, birthdate || null);\r\n  const user = db.prepare(\x27SELECT * FROM users WHERE id = ?\x27).get(info.lastInsertRowid);return { user };\n}";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "function registerUser(username, password, displayName, gender, birthdate) {\r\n  const existing = db.prepare(\x27SELECT id FROM users WHERE username = ?\x27).get(username);\r\n  if (existing) return { error: \x27username_taken\x27 };\r\n  const hash = bcrypt.hashSync(password, 10);\r\n  let newId;\r\n  do { newId = 1000 + Math.floor(Math.random() * 9000); } while (db.prepare(\x27SELECT id FROM users WHERE id = ?\x27).get(newId));\r\n  db.prepare(\r\n    \x27INSERT INTO users (id, username, password_hash, display_name, gender, birthdate) VALUES (?, ?, ?, ?, ?, ?)\x27\r\n  ).run(newId, username, hash, displayName || username, gender || null, birthdate || null);\r\n  const user = db.prepare(\x27SELECT * FROM users WHERE id = ?\x27).get(newId);return { user };\n}";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
