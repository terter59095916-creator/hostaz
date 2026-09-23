const fs = require("fs");
const lines = fs.readFileSync("C:\\bottle-server-kiraye\\server.js", "utf8").split("\n");
console.log("=== 1295-1320 ===");
for (let i = 1295; i < 1320; i++) console.log((i+1) + ": " + lines[i]);
console.log("=== 1435-1680 ===");
for (let i = 1435; i < 1680; i++) console.log((i+1) + ": " + lines[i]);
