const c = require("fs").readFileSync("server.js", "utf8");
const idx = c.indexOf("goto_specific_room alindi");
console.log(JSON.stringify(c.substring(idx, idx+300)));
