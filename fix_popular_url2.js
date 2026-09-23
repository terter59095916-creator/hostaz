const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "id: item.id,\n            title: item.snippet.title,\n            url: 'https://www.youtube.com/watch?v=' + item.id,\n            provider: 'cz'";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const rep = "id: item.id,\n            title: item.snippet.title,\n            url: '/api/audio-stream/' + item.id,\n            provider: 'cz'";
  c = c.replace(old, rep);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
