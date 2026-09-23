const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "const rooms = new Map();";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const liveSetup = "const liveStreamsMap = new Map();\nlet nextStreamId = 1;\n" + marker;
  c = c.replace(marker, liveSetup);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI, yeni uzunluq=" + c.length);
} else {
  console.log("MARKER TAPILMADI - baxmaq lazimdir");
}
