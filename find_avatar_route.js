const c = require("fs").readFileSync("server.js", "utf8");
const idx = c.indexOf("/api/avatar/:id");
console.log(JSON.stringify(c.substring(idx-20, idx+450)));
