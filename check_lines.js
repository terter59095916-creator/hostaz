const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const lines = c.split("\n");
for (let i = 795; i <= 802; i++) {
  console.log(i + ": " + JSON.stringify(lines[i]));
}
