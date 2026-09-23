const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;
const pairs = [10, 50, 100, 500, 1000];
pairs.forEach(n => {
  const old = "onclick: () => window.mgBuyCoins(" + n + ")";
  if (c.includes(old)) {
    c = c.split(old).join("purchase: () => window.mgBuyCoins(" + n + ")");
    count++;
  }
});
console.log("Deyisdirilenler: " + count + "/5");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
