const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker1 = "const BANNED_WORDS = [";
const firstIdx = c.indexOf(marker1);
const secondIdx = c.indexOf(marker1, firstIdx + 1);
console.log("first:", firstIdx, "second:", secondIdx);
if (secondIdx !== -1) {
  const endMarker = "const userIdToWs = new Map();";
  const endIdx = c.indexOf(endMarker);
  console.log("endIdx:", endIdx);
  // remove everything from secondIdx up to endIdx (the duplicate block)
  c = c.slice(0, secondIdx) + c.slice(endIdx);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI - tekrarlanan blok silindi");
}
