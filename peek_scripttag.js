const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\live_agora.html", "utf8");
const lines = c.split("\n");
console.log(JSON.stringify(lines[376]));
console.log(JSON.stringify(lines[377]));
console.log(JSON.stringify(lines[378]));
