const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "if (!youtubeResults || youtubeResults.length === 0) {\r\n          try {\r\n            const yt = await getInnertube();\r\n            const itSearch = await yt.search(q, { type: \x27video\x27 });\r\n            const itVideos = (itSearch.videos || []).slice(0, count);\r\n            youtubeResults = itVideos.map(v => ({\r\n              artist: (v.author && v.author.name) || \x27\x27,\r\n              duration: v.duration ? v.duration.seconds : 0,\r\n              id: v.id,\r\n              title: v.title ? v.title.text : \x27\x27,\r\n              url: \x27https://www.youtube.com/watch?v=\x27 + v.id,\r\n              provider: \x27cz\x27\r\n            }));";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (!finalResults || finalResults.length === 0) {\r\n          try {\r\n            const yt = await getInnertube();\r\n            const itSearch = await yt.search(q, { type: \x27video\x27 });\r\n            const itVideos = (itSearch.videos || []).slice(0, count);\r\n            finalResults = itVideos.map(v => ({\r\n              id: v.id,\r\n              title: v.title ? v.title.text : \x27\x27,\r\n              icon: req.protocol + \x27://\x27 + req.get(\x27host\x27) + \x27/api/thumbnail/\x27 + v.id,\r\n              duration: v.duration ? v.duration.seconds : 0\r\n            }));";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
