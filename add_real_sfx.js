const fs = require("fs");
const path = "game_v2/yandex_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = "if (!res.ok) { console.log(\x27Alis-veris xetasi: \x27 + data.error); }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "if (res.ok) { try { const snd = new Audio(\x27/mg-sfx/jackpot_coins.mp3\x27); snd.volume = 0.6; snd.play().catch(()=>{}); } catch(e) {} } else { console.log(\x27Alis-veris xetasi: \x27 + data.error); }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
