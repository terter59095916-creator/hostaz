const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "url: 'https://www.youtube.com/watch?v=' + item.id,\n            provider: 'cz'";
const count = (c.match(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
console.log("Tapilan sayi: " + count);
c = c.split(old).join("url: '/api/audio-stream/' + item.id,\n            provider: 'cz'");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
