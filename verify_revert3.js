const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\server.js", "utf8");
console.log("Has recvAchId:", c.includes("recvAchId"));
console.log("File length:", c.length);
