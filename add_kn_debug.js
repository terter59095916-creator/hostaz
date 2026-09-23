const fs = require("fs");
const path = "game_v2/yandex_v2.html";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "function knHandleMessage(msg) {\n    if (msg.type === 'user_kickout') {";
if (c.includes(old1)) {
  c = c.split(old1).join("function knHandleMessage(msg) {\n    console.log('KN-DEBUG msg type:', msg.type);\n    if (msg.type === 'user_kickout') {\n      console.log('KN-DEBUG user_kickout alindi:', JSON.stringify(msg));");
  count++;
}

const old2 = "knWs.onclose = () => { setTimeout(knConnect, 3000); };";
if (c.includes(old2)) {
  c = c.split(old2).join("knWs.onopen = () => { console.log('KN-DEBUG ws baglandi'); };\n    knWs.onclose = () => { console.log('KN-DEBUG ws baglanti kesildi'); setTimeout(knConnect, 3000); };");
  count++;
}

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
