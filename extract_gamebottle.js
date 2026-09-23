const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("if (msg.type === \x27game_bottle\x27 && ws.gameRoom) {");
const chunk = c.substring(idx, idx+400);
fs.writeFileSync("gamebottle_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
