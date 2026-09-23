const fs = require("fs");
const path = require("path");
const effects = require("C:\\bottle-server\\live-gift-effects.json");
const catalog = require("C:\\bottle-server\\tiktok_gift_catalog_full.json");
const catalogMap = new Map(catalog.map(g => [String(g.id), g]));

console.log("Total effects:", effects.length);
const results = effects.map(e => {
  const gift = catalogMap.get(String(e.gift_id));
  return { gift_id: e.gift_id, effect_id: e.effect_id, name: gift ? gift.name : "(TAPILMADI)", icon: gift ? gift.icon : null };
});
results.forEach(r => console.log(r.gift_id, "|", r.name, "|", r.icon));

fs.writeFileSync("C:\\bottle-server-kiraye\\animated_gifts_list.json", JSON.stringify(results, null, 2), "utf8");
console.log("Fayl yazildi: animated_gifts_list.json");
