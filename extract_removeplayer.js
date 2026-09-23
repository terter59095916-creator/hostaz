const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("function removePlayerFromRoom(room, ws)");
const chunk = c.substring(idx, idx+380);
fs.writeFileSync("removeplayer_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
