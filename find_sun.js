const c = require("fs").readFileSync("assets_current.json", "utf8");
const matches = c.match(/"[a-zA-Z_]*sun[a-zA-Z_]*"/gi);
console.log(matches ? [...new Set(matches)].join(", ") : "TAPILMADI");
