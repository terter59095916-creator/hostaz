const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("const rejoinUntilMs = Date.now()");
const chunk = c.substring(idx, idx+220);
fs.writeFileSync("rejoin_chunk_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
