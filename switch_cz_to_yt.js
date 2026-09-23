const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const count = (c.match(/provider: 'cz'/g) || []).length;
console.log("Tapilan sayi: " + count);
c = c.split("provider: 'cz'").join("provider: 'yt'");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
