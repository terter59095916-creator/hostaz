const fs = require("fs");
const data = JSON.parse(fs.readFileSync("C:\\bottle-server\\telegram.org\\tiktok_gift_catalog_full.json", "utf8"));
console.log("Type:", Array.isArray(data) ? "array" : typeof data);
const keys = Object.keys(data);
console.log("Top-level keys:", JSON.stringify(keys.slice(0, 20)));
console.log("Sample entry:", JSON.stringify(Array.isArray(data) ? data[0] : data[keys[0]], null, 2).substring(0, 800));
