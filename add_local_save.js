const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "        res.set('Content-Type', 'application/json');\n        res.set('Cache-Control', 'no-store');\n        res.send(JSON.stringify(json));";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "        try {\n          fs.writeFileSync(require('path').join(__dirname, 'game-assets', 'assets.json'), JSON.stringify(json));\n          console.log('WS: assets-proxy - lokal fayl yenilendi');\n        } catch (saveErr) {\n          console.error('assets-proxy lokal saxlama xetasi:', saveErr.message);\n        }\n        res.set('Content-Type', 'application/json');\n        res.set('Cache-Control', 'no-store');\n        res.send(JSON.stringify(json));";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
