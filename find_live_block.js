const c = require("fs").readFileSync("server.js", "utf8");
const startIdx = c.indexOf("} else if (msg.type === \x27start_live\x27) {");
const endIdx = c.indexOf("} else if (msg.type === \x27goto_user\x27) {");
console.log("startIdx:", startIdx, "endIdx:", endIdx, "uzunluq:", endIdx - startIdx);
