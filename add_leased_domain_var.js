const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const marker = "server.listen(PORT, () => {";
const idxMarker = c.indexOf(marker);
if (idxMarker !== -1) {
  const constDef = `const ALLOWED_ORIGINS = process.env.LEASED_DOMAIN
  ? process.env.LEASED_DOMAIN.split(",").map(d => d.trim())
  : ["https://renewed-growth-production-ba28.up.railway.app"];
` + marker;
  c = c.replace(marker, constDef);
}

const oldArr = "[\x27https://oyun-projem-production.up.railway.app\x27, \x27https://ureyimsen.com\x27, \x27https://www.ureyimsen.com\x27]";
const count = (c.match(new RegExp(oldArr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
console.log("Tapilan sayi: " + count);
c = c.split(oldArr).join("ALLOWED_ORIGINS");

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
