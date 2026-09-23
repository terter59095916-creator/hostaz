const fs = require("fs");
const path = "game_v2/yandex_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = "knConnect();\n})();";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "window.knOnGameMessage = function(obj) { knHandleMessage(obj); };\n  knConnect();\n})();";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
