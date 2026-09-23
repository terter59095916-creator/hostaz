const fs = require("fs");
const json = JSON.parse(fs.readFileSync("C:\\bottle-server\\game-assets\\assets.json", "utf8"));
const keys = Object.keys(json.achievement || {});
console.log("Total achievement keys:", keys.length);
const giftKeys = keys.filter(k => k.toLowerCase().includes("gift"));
console.log("Gift-related keys:", JSON.stringify(giftKeys));
if (giftKeys.length > 0) {
  giftKeys.forEach(k => console.log(k, "=>", JSON.stringify(json.achievement[k])));
} else {
  console.log("First 10 keys sample:", JSON.stringify(keys.slice(0, 10)));
  console.log("Sample structure:", JSON.stringify(json.achievement[keys[0]]));
}
