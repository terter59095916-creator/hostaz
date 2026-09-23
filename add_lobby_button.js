const fs = require("fs");
const path = "game_v2/yandex_v2.html";
let c = fs.readFileSync(path, "utf8");
const inject = `
<button id="mg-lobby-btn" onclick="window.location.href='/profile-v2'" style="position:fixed; top:10px; right:10px; z-index:99998; background:linear-gradient(155deg,#F0C05A,#E63950); border:none; border-radius:20px; padding:8px 14px; color:#fff; font-weight:700; font-size:12px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,.4); font-family:sans-serif;">Dehlize qayit</button>
</body>`;
c = c.replace("</body>", inject);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
