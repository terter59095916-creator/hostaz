const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\game_v2\\preloader_new.js", "utf8");
console.log("File length:", c.length);
console.log("needsTranslation count:", (c.match(/needsTranslation/g) || []).length);
const idx = c.indexOf("needsTranslation(sender");
console.log("idx of needsTranslation(sender:", idx);
if (idx >= 0) console.log(JSON.stringify(c.substring(idx - 50, idx + 100)));
