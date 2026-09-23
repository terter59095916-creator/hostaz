const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("INSERT INTO users (username, display_name, avatar_data, facebook_id)");
const chunk = c.substring(idx-30, idx+250);
fs.writeFileSync("facebook_insert_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
