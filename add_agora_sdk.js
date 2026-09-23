const fs = require("fs");
const path = "C:\\bottle-server\\live_agora.html";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "</head>";
console.log("Found:", c.includes(old1));

const new1 = "<script src=\"https://download.agora.io/sdk/release/AgoraRTC_N.js\"></script>\r\n</head>";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
