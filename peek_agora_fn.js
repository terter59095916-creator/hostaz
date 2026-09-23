const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\live_agora.html", "utf8");
const idx = c.indexOf("async function agoraStartBroadcast");
console.log(JSON.stringify(c.substring(idx, idx + 250)));
