const fs = require("fs");
const c = fs.readFileSync("profile_v2.html", "utf8");
const idx = c.indexOf("function openStory(s) {");
const endIdx = c.indexOf("function closeStory() {");
const chunk = c.substring(idx, endIdx);
fs.writeFileSync("openstory_output.txt", chunk);
console.log("idx=" + idx + " endIdx=" + endIdx);
