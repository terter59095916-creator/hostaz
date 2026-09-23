const fs = require("fs");
const c = fs.readFileSync("game_v2/preloader_new.js", "utf8");
const idx = c.indexOf("const getKickoutBtn = () => {");
const chunk = c.substring(idx, idx+520);
fs.writeFileSync("kickout_chunk_output.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
