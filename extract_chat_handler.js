const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("msg.type === \x27game_chat_message\x27)) {");
const chunk = c.substring(idx, idx+150);
fs.writeFileSync("chat_handler_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
