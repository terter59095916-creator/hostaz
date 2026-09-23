const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const lines = c.split("\n");
for (let i = 1029; i <= 1038; i++) {
  console.log(i + ": " + JSON.stringify(lines[i]));
}
