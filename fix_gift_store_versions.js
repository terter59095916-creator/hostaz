const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "        if (json.gifts && Array.isArray(json.gifts.__store)) {\n            const existingGiftIds = new Set(json.gifts.__store.map(g => g.id));\n            const allGiftKeys = Object.keys(json.gifts).filter(k => k !== '__store');\n            allGiftKeys.forEach(key => {\n                if (!existingGiftIds.has(key)) {\n                    json.gifts.__store.push({ id: key });\n                }\n            });\n            console.log('WS: assets-proxy - hediyye sayi genislenildi, yeni __store uzunlugu=' + json.gifts.__store.length);\n        }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "        if (json.gifts) {\n            const skipKeys = ['id','type'];\n            const allGiftKeys = Object.keys(json.gifts).filter(k => !k.startsWith('__store') && k !== '__store');\n            const storeVersionKeys = Object.keys(json.gifts).filter(k => k.startsWith('__store_v'));\n            storeVersionKeys.forEach(storeKey => {\n                if (Array.isArray(json.gifts[storeKey])) {\n                    const existingIds = new Set(json.gifts[storeKey].map(g => g.id));\n                    allGiftKeys.forEach(key => {\n                        if (!existingIds.has(key)) {\n                            json.gifts[storeKey].push({ id: key });\n                        }\n                    });\n                }\n            });\n            if (Array.isArray(json.gifts.__store)) {\n                const existingIds0 = new Set(json.gifts.__store.map(g => g.id));\n                allGiftKeys.forEach(key => {\n                    if (!existingIds0.has(key)) json.gifts.__store.push({ id: key });\n                });\n            }\n            console.log('WS: assets-proxy - hediyye store versiyalari genislenildi: ' + storeVersionKeys.join(\x27,\x27));\n        }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
