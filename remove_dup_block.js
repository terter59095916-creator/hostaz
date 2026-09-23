const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "let moveNewRoom = null;";
const first = c.indexOf(marker);
const second = c.indexOf(marker, first + 1);
const endMarker = "console.log(\x27WS: kickout - istifadeci kenarlasdirildi - target=\x27";
const endIdx = c.indexOf(endMarker);
console.log("second:", second, "endIdx:", endIdx);
if (second !== -1 && endIdx !== -1) {
  c = c.slice(0, second) + c.slice(endIdx);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI - tekrarlanan blok silindi");
}
