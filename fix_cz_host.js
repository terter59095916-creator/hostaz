const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "const service = new CilizMusicService(\x27https://music.ciliz.com/api\x27, session.viewer, social.id);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const service = new CilizMusicService(\x27/api/ciliz-music\x27, session.viewer, social.id);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
