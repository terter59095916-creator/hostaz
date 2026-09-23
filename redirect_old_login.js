const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "app.get('/login', (req, res) => {\r\n    res.sendFile(path.join(__dirname, 'login.html'));\r\n});";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "app.get('/login', (req, res) => {\r\n    res.redirect('/login-v2');\r\n});";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
