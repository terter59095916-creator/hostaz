const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "console.log(\x27WS: assets-proxy - hediyye store versiyalari genislenildi: \x27 + storeVersionKeys.join(\x27,\x27));\n        }";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const addition = marker + "\n        if (json.achievement) {\n          Object.keys(json.achievement).forEach(k => {\n            const ach = json.achievement[k];\n            if (ach.counters && Array.isArray(ach.counters)) {\n              ach.counters = ach.counters.map(n => (typeof n === \x27number\x27) ? Math.round(n * 2) : n);\n            }\n          });\n          console.log(\x27WS: assets-proxy - nailiyyet heddleri 2x cetinlesdirildi\x27);\n        }";
  c = c.replace(marker, addition);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
} else {
  console.log("MARKER TAPILMADI - basqa yerde axtarilmalidir");
}
