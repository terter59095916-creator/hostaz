const fs = require("fs");
const data = JSON.parse(fs.readFileSync("C:\\bottle-server\\telegram.org\\tiktok_gift_catalog_full.json", "utf8"));
const path = require("path");
const videoFiles = fs.readdirSync("C:\\bottle-server\\public\\live-gift-videos");
const videoIds = videoFiles.map(f => parseInt(f.match(/effect-(\d+)\.mp4/)[1]));
console.log("Total video IDs:", videoIds.length);

const matched = data.filter(g => videoIds.includes(g.id));
console.log("Matched gifts:", matched.length);
matched.forEach(g => console.log(g.id, "|", g.name, "|", g.icon));

const unmatched = videoIds.filter(id => !data.some(g => g.id === id));
console.log("Unmatched video IDs (no catalog entry):", JSON.stringify(unmatched));
