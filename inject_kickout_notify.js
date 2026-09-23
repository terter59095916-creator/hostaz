const fs = require("fs");
const content = fs.readFileSync("game_v2/yandex_v2.html", "utf8");
const notify = fs.readFileSync("kickout_notify.txt", "utf8");
const content2 = content.replace("</body>", notify + "\n</body>");
const changed = content2 !== content;
console.log("Deyisdirildi: " + changed);
fs.writeFileSync("game_v2/yandex_v2.html", content2, "utf8");

const scripts = [...content2.matchAll(/<script>([\s\S]*?)<\/script>/g)];
scripts.forEach((m,i) => { try { new Function(m[1]); console.log("Script " + i + ": OK"); } catch(e) { console.log("Script " + i + ": XETA - " + e.message); } });
