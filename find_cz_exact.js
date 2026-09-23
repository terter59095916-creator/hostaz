const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("id: videoId,\n              title: item.title,\n              url: item.url,\n              provider: 'cz'\n            };");
console.log("idx=" + idx);
if (idx !== -1) {
  const chunk = c.substring(idx, idx+120);
  fs.writeFileSync("cz_exact.txt", JSON.stringify(chunk));
}
