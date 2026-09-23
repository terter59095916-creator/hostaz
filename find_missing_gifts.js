const fs = require("fs");
const jsContent = fs.readFileSync("preloader_okru.js", "utf8");
const giftKeys = JSON.parse(fs.readFileSync("gift_keys.json", "utf8"));
const giftSet = new Set(giftKeys);
const pattern = /gift_type[\x27"]?\s*[:=]\s*[\x27"]([a-zA-Z0-9_]+)[\x27"]/g;
const found = new Set();
let m;
while ((m = pattern.exec(jsContent)) !== null) {
  found.add(m[1]);
}
const missing = [...found].filter(x => !giftSet.has(x));
console.log("Kodda tapilan gift_type sayi: " + found.size);
console.log("Sizin siyahida OLMAYAN: " + missing.join(", "));
