const catalog = require("C:\\bottle-server\\tiktok_gift_catalog_full.json");
const effects = require("C:\\bottle-server\\live-gift-effects.json");
const effectMap = new Set(effects.map(e => String(e.gift_id)));
console.log("Total gifts in catalog:", catalog.length);
console.log("Gifts with animation:", catalog.filter(g => effectMap.has(String(g.id))).length);
