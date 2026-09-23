const fs = require("fs");

const assets = JSON.parse(fs.readFileSync("assets_current.json", "utf8"));
const gestures = assets.gestures.__store_v2 || [];
const sorted = [...gestures].sort((a,b) => a.kisses_s - b.kisses_s);
const n = sorted.length;
const bucketSize = Math.ceil(n / 5);
const prices = [3, 5, 10, 30, 180];

let raw = fs.readFileSync("gift-prices.json", "utf8");
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const priceMap = JSON.parse(raw);

let updated = 0;
sorted.forEach((g, i) => {
  const tier = Math.min(4, Math.floor(i / bucketSize));
  priceMap[g.id] = prices[tier];
  updated++;
});

fs.writeFileSync("gift-prices.json", JSON.stringify(priceMap, null, 2), "utf8");
console.log("Yenilenen jest sayi: " + updated);
console.log("3 coin: " + JSON.stringify(sorted.slice(0,12).map(g=>g.id)));
console.log("180 coin: " + JSON.stringify(sorted.slice(-12).map(g=>g.id)));
