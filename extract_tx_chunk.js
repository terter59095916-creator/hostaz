const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("db.transaction");
const chunk = c.substring(idx-50, idx+550);
fs.writeFileSync("tx_chunk_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
