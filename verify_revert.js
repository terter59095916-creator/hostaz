const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\server.js", "utf8");
console.log("Has recvAchId (should be FALSE if reverted):", c.includes("recvAchId"));
console.log("Has no-cache header (should be TRUE):", c.includes("no-store, no-cache, must-revalidate"));
console.log("File length:", c.length);
