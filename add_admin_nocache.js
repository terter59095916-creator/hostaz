const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "app.use('/admin', express.static(path.join(__dirname, 'public', 'admin'), { etag: false, lastModified: false, setHeaders: (res) => { res.set('Cache-Control', 'no-store, no-cache, must-revalidate'); } }));";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
