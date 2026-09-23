const c = require("fs").readFileSync("server.js", "utf8");
const idx = c.indexOf("function removePlayerFromRoom");
console.log(JSON.stringify(c.substring(idx, idx+280)));
