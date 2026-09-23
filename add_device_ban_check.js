const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const old1 = "app.post('/api/register', async (req, res) => {\r\n    try {\r\n        const { username, password, gender, birthdate, device_id } = req.body || {};\r\n        if (!username || !password) {\r\n            return res.status(400).json({ error: 'username_and_password_required' });\r\n        }\r\n        const clientIp = getClientIp(req);";
const idx1 = c.indexOf(old1);
console.log("register tapildi:", idx1 !== -1);
if (idx1 !== -1) {
  const rep1 = "app.post('/api/register', async (req, res) => {\r\n    try {\r\n        const { username, password, gender, birthdate, device_id } = req.body || {};\r\n        if (!username || !password) {\r\n            return res.status(400).json({ error: 'username_and_password_required' });\r\n        }\r\n        const clientIp = getClientIp(req);\r\n        if (device_id) {\r\n            const bannedDev = db.prepare('SELECT * FROM banned_devices WHERE device_id = ?').get(device_id);\r\n            if (bannedDev) return res.status(403).json({ error: 'device_banned' });\r\n        }";
  c = c.replace(old1, rep1);
}

const old2 = "app.post('/api/login', async (req, res) => {\r\n    try {\r\n        const { username, password, device_id } = req.body || {};\r\n        const user = authLib.verifyUser(username, password);";
const idx2 = c.indexOf(old2);
console.log("login tapildi:", idx2 !== -1);
if (idx2 !== -1) {
  const rep2 = "app.post('/api/login', async (req, res) => {\r\n    try {\r\n        const { username, password, device_id } = req.body || {};\r\n        if (device_id) {\r\n            const bannedDev = db.prepare('SELECT * FROM banned_devices WHERE device_id = ?').get(device_id);\r\n            if (bannedDev) return res.status(403).json({ error: 'device_banned' });\r\n        }\r\n        const user = authLib.verifyUser(username, password);";
  c = c.replace(old2, rep2);
}

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
