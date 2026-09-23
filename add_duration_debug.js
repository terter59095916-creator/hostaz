const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "return {\n              artist: (item.author && item.author.name) || \x27\x27,\n              duration: durSec,\n              id: videoId,\n              title: item.title,\n              url: item.url,\n              provider: \x27cz\x27\n            };";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "console.log(\x27CZ-DURATION-DEBUG: raw=\x27 + item.duration + \x27 parsed=\x27 + durSec + \x27 title=\x27 + item.title);\n            return {\n              artist: (item.author && item.author.name) || \x27\x27,\n              duration: durSec,\n              id: videoId,\n              title: item.title,\n              url: item.url,\n              provider: \x27cz\x27\n            };";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
