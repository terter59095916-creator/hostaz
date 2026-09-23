const fs = require("fs");
const c = fs.readFileSync("auth.js", "utf8");
const idx = c.indexOf("function registerUser");
const chunk = c.substring(idx, idx+600);
fs.writeFileSync("registerUser_check.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
