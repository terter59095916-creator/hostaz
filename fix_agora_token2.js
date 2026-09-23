const fs = require("fs");
const path = "C:\\bottle-server\\live_agora.html";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "async function agoraStartBroadcast(channelName) {\n    await agoraInit();\n    await agoraClient.setClientRole('host');\n    await agoraClient.join(AGORA_APP_ID, channelName, null, null);";
console.log("Found:", c.includes(old1));

const new1 = "async function agoraStartBroadcast(channelName, token) {\n    await agoraInit();\n    await agoraClient.setClientRole('host');\n    await agoraClient.join(AGORA_APP_ID, channelName, token || null, null);";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
