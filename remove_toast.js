const fs = require("fs");
const path = "game_v2/yandex_v2.html";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "if (res.ok) { if (data.bonus > 0) { try { const snd = new Audio(\x27/api/assets-proxy/sfx/jackpot_coins.mp3\x27); snd.volume = 0.6; snd.play().catch(()=>{}); } catch(e) {} } mgToast(\x27+\x27 + data.coins_added + \x27 coin\x27 + (data.bonus > 0 ? \x27 (\x27 + data.bonus + \x27 bonus daxil)\x27 : \x27\x27)); } else { mgToast(data.error || \x27Xeta bas verdi\x27); }";
if (c.includes(old1)) {
  c = c.split(old1).join("if (!res.ok) { console.log(\x27Alis-veris xetasi: \x27 + data.error); }");
  count++;
}

const old2 = "if (res.ok) { mgToast(\x27VIP status aktivdir!\x27); } else { mgToast(data.error || \x27Xeta bas verdi\x27); }";
if (c.includes(old2)) {
  c = c.split(old2).join("if (!res.ok) { console.log(\x27VIP alma xetasi: \x27 + data.error); }");
  count++;
}

const old3 = "if (res.ok) { mgToast(data.already_owned ? \x27Artiq var!\x27 : \x27Premium Pass alindi!\x27); } else { mgToast(data.error || \x27Xeta bas verdi\x27); }";
if (c.includes(old3)) {
  c = c.split(old3).join("if (!res.ok) { console.log(\x27Pass alma xetasi: \x27 + data.error); }");
  count++;
}

console.log("Deyisdirilenler: " + count + "/3");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
