const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const badDef = `const ALLOWED_ORIGINS = process.env.LEASED_DOMAIN
  ? process.env.LEASED_DOMAIN.split(",").map(d => d.trim())
  : ["https://renewed-growth-production-ba28.up.railway.app"];
server.listen(PORT, () => {`;
const idx1 = c.indexOf(badDef);
console.log("Kohne yer tapildi:", idx1 !== -1);
if (idx1 !== -1) {
  c = c.replace(badDef, "server.listen(PORT, () => {");
}

const licenseEnd = "* ===================================================================\n */\n";
const idx2 = c.indexOf(licenseEnd);
console.log("Lisenziya sonu tapildi:", idx2 !== -1);
if (idx2 !== -1) {
  const insertAt = idx2 + licenseEnd.length;
  const goodDef = `const ALLOWED_ORIGINS = process.env.LEASED_DOMAIN
  ? process.env.LEASED_DOMAIN.split(",").map(d => d.trim())
  : ["https://renewed-growth-production-ba28.up.railway.app"];
`;
  c = c.slice(0, insertAt) + goodDef + c.slice(insertAt);
}

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
