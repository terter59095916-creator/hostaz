const fs = require("fs");
const path = "game_v2/yandex_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = "<button data-mg-amt=\"10\" style=\"background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;\">10 coin - 10\u{1F48E}</button>\n        <button data-mg-amt=\"50\" style=\"background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;\">50 coin - 50\u{1F48E}</button>\n        <button data-mg-amt=\"100\" style=\"background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;\">100 coin - 100\u{1F48E}</button>\n        <button data-mg-amt=\"500\" style=\"background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;\">500 coin - 500\u{1F48E}</button>\n        <button data-mg-amt=\"1000\" style=\"grid-column:span 2;background:linear-gradient(155deg,#3d2755,#2c1a3f);border:1px solid #ffce85;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;\">1000 coin (+10% bonus) - 1000\u{1F48E}</button>";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "<button data-mg-amt=\"1000\" style=\"grid-column:span 2;background:linear-gradient(155deg,#3d2755,#2c1a3f);border:1px solid #ffce85;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;\">1000 coin (+10% bonus) - 1000\u{1F48E}</button>\n        <button data-mg-amt=\"500\" style=\"background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;\">500 coin - 500\u{1F48E}</button>\n        <button data-mg-amt=\"100\" style=\"background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;\">100 coin - 100\u{1F48E}</button>\n        <button data-mg-amt=\"50\" style=\"background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;\">50 coin - 50\u{1F48E}</button>\n        <button data-mg-amt=\"10\" style=\"grid-column:span 2;background:#2c1a3f;border:1px solid #555;border-radius:10px;padding:10px 6px;color:#fff;cursor:pointer;\">10 coin - 10\u{1F48E}</button>";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
