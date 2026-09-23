const fs = require("fs");
const c = fs.readFileSync("profile_v2.html", "utf8");
const idx = c.indexOf("async function saveSettings() {");
const endIdx = c.indexOf("function openThemePicker() {");
const chunk = c.substring(idx, endIdx);
fs.writeFileSync("savesettings_output.txt", chunk);
console.log("saved, idx=" + idx + " endIdx=" + endIdx);
