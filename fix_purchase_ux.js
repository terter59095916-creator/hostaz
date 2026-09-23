const fs = require("fs");
const path = "game_v2/yandex_v2.html";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const toastHelper = "function mgToast(msg) {\nconst t = document.createElement('div');\nt.textContent = msg;\nt.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:linear-gradient(155deg,#F0C05A,#E63950); color:#fff; padding:12px 24px; border-radius:20px; font-weight:700; font-size:14px; z-index:999999; box-shadow:0 4px 20px rgba(0,0,0,.5); font-family:sans-serif; animation:mgFadeInOut 2.5s ease forwards;';\nconst style = document.createElement('style');\nstyle.textContent = '@keyframes mgFadeInOut { 0% {opacity:0; transform:translate(-50%,-10px);} 15% {opacity:1; transform:translate(-50%,0);} 85% {opacity:1;} 100% {opacity:0; transform:translate(-50%,-10px);} }';\nif (!document.getElementById('mg-toast-style')) { style.id = 'mg-toast-style'; document.head.appendChild(style); }\ndocument.body.appendChild(t);\nsetTimeout(() => t.remove(), 2600);\n}\n";

const old1 = "if (res.ok) { alert(data.coins_added + \x27 coin elave edildi!\x27); location.reload(); } else { alert(data.error || \x27Xeta\x27); }";
if (c.includes(old1)) {
  c = c.split(old1).join("if (res.ok) { mgToast(\x27+\x27 + data.coins_added + \x27 coin\x27 + (data.bonus > 0 ? \x27 (\x27 + data.bonus + \x27 bonus daxil)\x27 : \x27\x27)); } else { mgToast(data.error || \x27Xeta bas verdi\x27); }");
  count++;
}

const old2 = "if (res.ok) { alert(\x27VIP alindi!\x27); location.reload(); } else { alert(data.error || \x27Xeta\x27); }";
if (c.includes(old2)) {
  c = c.split(old2).join("if (res.ok) { mgToast(\x27VIP status aktivdir!\x27); } else { mgToast(data.error || \x27Xeta bas verdi\x27); }");
  count++;
}

const old3 = "if (res.ok) { alert(data.already_owned ? \x27Artiq var!\x27 : \x27Premium Pass alindi!\x27); location.reload(); } else { alert(data.error || \x27Xeta\x27); }";
if (c.includes(old3)) {
  c = c.split(old3).join("if (res.ok) { mgToast(data.already_owned ? \x27Artiq var!\x27 : \x27Premium Pass alindi!\x27); } else { mgToast(data.error || \x27Xeta bas verdi\x27); }");
  count++;
}

c = c.split("function mgToken() {").join(toastHelper + "function mgToken() {");
count++;

console.log("Deyisdirilenler: " + count + "/4");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
