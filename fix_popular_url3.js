const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "id: item.id,\r\n            title: item.snippet.title,\r\n            url: \x27https://www.youtube.com/watch?v=\x27 + item.id,\r\n            provider: \x27cz\x27";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const rep = "id: item.id,\r\n            title: item.snippet.title,\r\n            url: \x27/api/audio-stream/\x27 + item.id,\r\n            provider: \x27cz\x27";
  c = c.replace(old, rep);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
