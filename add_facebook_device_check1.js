const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const old1 = "const { access_token } = req.body || {};\n        if (!access_token) return res.status(400).json({ error: \x27access_token_required\x27 });";
const idx1 = c.indexOf(old1);
console.log("Tapildi 1:", idx1 !== -1);
if (idx1 !== -1) {
  const rep1 = "const { access_token, device_id } = req.body || {};\n        if (!access_token) return res.status(400).json({ error: \x27access_token_required\x27 });\n        if (device_id) {\n          const bannedDevF = db.prepare(\x27SELECT * FROM banned_devices WHERE device_id = ?\x27).get(device_id);\n          if (bannedDevF) return res.status(403).json({ error: \x27device_banned\x27 });\n        }";
  c = c.replace(old1, rep1);
}

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI qismet 1");
