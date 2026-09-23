const fs = require("fs");
const lines = fs.readFileSync("C:\\bottle-server-kiraye\\server.js", "utf8").split("\n");
for (let i = 3383; i < 3395; i++) console.log((i+1) + ": " + JSON.stringify(lines[i]));
console.log("---");
for (let i = 3826; i < 3840; i++) console.log((i+1) + ": " + JSON.stringify(lines[i]));
