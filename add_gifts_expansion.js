const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "        if (json.bottles && Array.isArray(json.bottles.__store)) {\n            const existingIds = new Set(json.bottles.__store.map(b => b.id));\n            const allBottleKeys = Object.keys(json.bottles).filter(k => k !== '__store');\n            allBottleKeys.forEach(key => {\n                if (!existingIds.has(key)) {\n                    json.bottles.__store.push({ id: key });\n                }\n            });\n            console.log('WS: assets-proxy - sise sayi genisleneildi, yeni __store uzunlugu=' + json.bottles.__store.length);\n        }";
const idx = c.indexOf(old);
console.log("bottles Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = old + "\n        if (json.gifts && Array.isArray(json.gifts.__store)) {\n            const existingGiftIds = new Set(json.gifts.__store.map(g => g.id));\n            const allGiftKeys = Object.keys(json.gifts).filter(k => k !== '__store');\n            allGiftKeys.forEach(key => {\n                if (!existingGiftIds.has(key)) {\n                    json.gifts.__store.push({ id: key });\n                }\n            });\n            console.log('WS: assets-proxy - hediyye sayi genislenildi, yeni __store uzunlugu=' + json.gifts.__store.length);\n        }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
