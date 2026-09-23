const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (!youtubeResults || youtubeResults.length === 0) {\n          try {\n            const yt = await getInnertube();\n            const itSearch = await yt.search(q, { type: \x27video\x27 });\n            const itVideos = (itSearch.videos || []).slice(0, count);\n            youtubeResults = itVideos.map(v => ({\n              artist: (v.author && v.author.name) || \x27\x27,\n              duration: v.duration ? v.duration.seconds : 0,\n              id: v.id,\n              title: v.title ? v.title.text : \x27\x27,\n              url: \x27https://www.youtube.com/watch?v=\x27 + v.id,\n              provider: \x27cz\x27\n            }));";
const idx = c.lastIndexOf(old);
console.log("Tapildi (son occurrence):", idx !== -1);
if (idx !== -1) {
  const replacement = "if (!finalResults || finalResults.length === 0) {\n          try {\n            const yt = await getInnertube();\n            const itSearch = await yt.search(q, { type: \x27video\x27 });\n            const itVideos = (itSearch.videos || []).slice(0, count);\n            finalResults = itVideos.map(v => ({\n              id: v.id,\n              title: v.title ? v.title.text : \x27\x27,\n              icon: req.protocol + \x27://\x27 + req.get(\x27host\x27) + \x27/api/thumbnail/\x27 + v.id,\n              duration: v.duration ? v.duration.seconds : 0\n            }));";
  c = c.substring(0, idx) + replacement + c.substring(idx + old.length);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
