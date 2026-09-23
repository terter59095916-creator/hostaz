const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "prepareBank: () => Promise.resolve({ vipOptions: () => [], purchaseOptions: () => [], welcomeOffer: () => false, giftOptions: () => [], premiumOption: () => undefined })";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "prepareBank: () => Promise.resolve({ vipOptions: () => [{ period: \x271 hefte\x27, isPopular: false, price: \x27300 kristal\x27, term: \x27\x27, isInfo: false, purchase: () => window.mgBuyVip(\x27week\x27) },{ period: \x271 ay\x27, isPopular: true, price: \x27500 kristal\x27, term: \x27\x27, isInfo: false, purchase: () => window.mgBuyVip(\x27month\x27) }], purchaseOptions: () => [{ gold: 10, bonus: 0, price: \x2710 kristal\x27, onclick: () => window.mgBuyCoins(10) },{ gold: 50, bonus: 0, price: \x2750 kristal\x27, onclick: () => window.mgBuyCoins(50) },{ gold: 100, bonus: 0, price: \x27100 kristal\x27, onclick: () => window.mgBuyCoins(100) },{ gold: 500, bonus: 0, price: \x27500 kristal\x27, onclick: () => window.mgBuyCoins(500) },{ gold: 1000, bonus: 100, price: \x271000 kristal\x27, onclick: () => window.mgBuyCoins(1000) }], welcomeOffer: () => false, giftOptions: () => [], premiumOption: () => ({ price: \x27500 kristal\x27, purchase: () => window.mgBuyPass() }) })";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
