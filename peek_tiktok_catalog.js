const fs = require("fs");
const data = JSON.parse(fs.readFileSync("C:\\bottle-server\\tiktok_gifts_catalog.json", "utf8"));
console.log("Type:", Array.isArray(data) ? "array" : typeof data);
console.log("Sample:", JSON.stringify(Array.isArray(data) ? data[0] : Object.values(data)[0], null, 2));
console.log("Total count:", Array.isArray(data) ? data.length : Object.keys(data).length);
