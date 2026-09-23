const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\live_agora.html", "utf8");
console.log("agoraStartBroadcast present:", c.includes("function agoraStartBroadcast"));
console.log("agoraJoinAsViewer present:", c.includes("function agoraJoinAsViewer"));
console.log("Open <script> tags:", (c.match(/<script[\s>]/g) || []).length);
console.log("Close </script> tags:", (c.match(/<\/script>/g) || []).length);
