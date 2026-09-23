const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "url: item.url,\n              provider: \x27cz\x27";
const count = (c.match(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
console.log("Tapilan sayi: " + count);
if (count === 1) {
  c = c.replace(old, "url: \x27/api/audio-stream/\x27 + videoId,\n              provider: \x27cz\x27");
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
} else {
  console.log("Say 1 deyil, ehtiyatli olmaq lazimdir");
}
