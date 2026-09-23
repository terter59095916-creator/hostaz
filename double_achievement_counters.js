const fs = require("fs");
const path = "game-assets/assets.json";
let raw = fs.readFileSync(path, "utf8");
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const data = JSON.parse(raw);
let changed = 0;
Object.keys(data.achievement).forEach(k => {
  const ach = data.achievement[k];
  if (ach.counters && Array.isArray(ach.counters)) {
    ach.counters = ach.counters.map(n => (typeof n === "number") ? Math.round(n * 2) : n);
    changed++;
  }
});
fs.writeFileSync(path, JSON.stringify(data), "utf8");
console.log("Deyisdirilen nailiyyet sayi: " + changed);
