const fs = require("fs");
const c = fs.readFileSync("profile_v2.html", "utf8");
const idx = c.indexOf("class=\"add\">");
const chunk = c.substring(idx-30, idx+350);
fs.writeFileSync("addstory_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
