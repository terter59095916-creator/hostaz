const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const marker = "let moveNewRoom = null;";
const first = c.indexOf(marker);
const second = c.indexOf(marker, first + 1);
console.log("first:", first, "second:", second);
const endMarker = "console.log(\x27WS: kickout - istifadeci kenarlasdirildi - target=\x27";
const endIdx = c.indexOf(endMarker);
console.log("endIdx:", endIdx);
