const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\live_agora.html", "utf8");
console.log("Has token param:", c.includes("agoraStartBroadcast(channelName, token)"));
