const fs = require("fs");
const lines = fs.readFileSync("C:\\bottle-server-kiraye\\server.js", "utf8").split("\n");
for (let i = 2990; i < 3045; i++) console.log((i+1) + ": " + lines[i]);
