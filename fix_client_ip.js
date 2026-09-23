const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "function getClientIp(req) {\r\n    const xff = req.headers['x-forwarded-for'];\r\n    if (xff) return xff.split(',')[0].trim();\r\n    return req.ip || (req.connection && req.connection.remoteAddress) || '';\r\n}";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "function getClientIp(req) {\r\n    const cfIp = req.headers['cf-connecting-ip'];\r\n    if (cfIp) return cfIp.trim();\r\n    const xff = req.headers['x-forwarded-for'];\r\n    if (xff) return xff.split(',')[0].trim();\r\n    return req.ip || (req.connection && req.connection.remoteAddress) || '';\r\n}";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
