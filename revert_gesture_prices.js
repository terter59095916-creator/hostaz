const fs = require("fs");

const assets = JSON.parse(fs.readFileSync("assets_current.json", "utf8"));
const gestures = assets.gestures.__store_v2 || [];

let raw = fs.readFileSync("gift-prices.json", "utf8");
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const priceMap = JSON.parse(raw);

let reverted = 0;
gestures.forEach(g => {
  priceMap[g.id] = 1;
  reverted++;
});

fs.writeFileSync("gift-prices.json", JSON.stringify(priceMap, null, 2), "utf8");
console.log("Geri qaytarilan jest sayi: " + reverted);
