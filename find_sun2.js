const c = require("fs").readFileSync("assets_current.json", "utf8");
const idx = c.indexOf("\"sun\"");
console.log(c.substring(Math.max(0,idx-200), idx+300));
