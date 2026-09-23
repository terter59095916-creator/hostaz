const c = require("fs").readFileSync("server.js", "utf8");
const idx = c.indexOf("const friendGamesResponse");
console.log(JSON.stringify(c.substring(idx, idx+230)));
