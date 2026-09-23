const fs = require("fs");
const path = "game_v2/yandex_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = "if (res.ok) { mgToast(\x27+\x27 + data.coins_added + \x27 coin\x27 + (data.bonus > 0 ? \x27 (\x27 + data.bonus + \x27 bonus daxil)\x27 : \x27\x27)); } else { mgToast(data.error || \x27Xeta bas verdi\x27); }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  c = c.replace(old, "if (!res.ok) { console.log(\x27Alis-veris xetasi: \x27 + data.error); }");
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
