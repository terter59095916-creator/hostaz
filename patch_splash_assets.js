const fs = require("fs");
const path = "game_v2/splash_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "loadJSON(serverUrl, p.num(\x27server\x27)).then(serverJSON => loadJSON(serverJSON.assets.url, p.num(\x27assets\x27)).then(assetsJSON => ({";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "loadJSON(serverUrl, p.num(\x27server\x27)).then(serverJSON => loadJSON(window.location.origin + \x27/api/assets-proxy\x27, p.num(\x27assets\x27)).then(assetsJSON => ({";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
