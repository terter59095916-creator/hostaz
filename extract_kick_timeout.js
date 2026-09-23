const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("if (targetWsKO.gameRoom) removePlayerFromRoom(targetWsKO.gameRoom, targetWsKO);");
const chunk = c.substring(idx-20, idx+150);
fs.writeFileSync("kick_timeout_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
