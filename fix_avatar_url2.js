const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "app.get(\x27/api/avatar/:id\x27, (req, res) => {\r\n    const user = db.prepare(\x27SELECT avatar_data FROM users WHERE id = ?\x27).get(req.params.id);\r\n    if (!user || !user.avatar_data) return res.status(404).send(\x27No avatar\x27);\r\n    const matches = user.avatar_data.match(/^data:(image\\/\\w+);base64,(.+)$/);\r\n    if (!matches) return res.status(400).send(\x27Invalid avatar data\x27);\r\n    const buffer = Buffer.from(matches[2], \x27base64\x27);\r\n    res.set(\x27Content-Type\x27, matches[1]);\r\n    res.send(buffer);\r\n});";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "app.get(\x27/api/avatar/:id\x27, (req, res) => {\r\n    const user = db.prepare(\x27SELECT avatar_data FROM users WHERE id = ?\x27).get(req.params.id);\r\n    if (!user || !user.avatar_data) return res.status(404).send(\x27No avatar\x27);\r\n    if (user.avatar_data.startsWith(\x27http://\x27) || user.avatar_data.startsWith(\x27https://\x27)) {\r\n        return res.redirect(user.avatar_data);\r\n    }\r\n    const matches = user.avatar_data.match(/^data:(image\\/\\w+);base64,(.+)$/);\r\n    if (!matches) return res.status(400).send(\x27Invalid avatar data\x27);\r\n    const buffer = Buffer.from(matches[2], \x27base64\x27);\r\n    res.set(\x27Content-Type\x27, matches[1]);\r\n    res.send(buffer);\r\n});";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
