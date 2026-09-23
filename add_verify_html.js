const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "<div class=\"name-row\"><h1 id=\"profile-name\">";
if (c.includes(old1)) {
  c = c.split(old1).join("<div class=\"name-row\"><h1 id=\"profile-name\">");
}
const old1b = "id=\"profile-name\">";
const nameIdx = c.indexOf(old1b);
const closeH1 = c.indexOf("</h1>", nameIdx);
if (nameIdx !== -1 && closeH1 !== -1) {
  c = c.slice(0, closeH1) + "</h1><span id=\"profile-verify-badge\" class=\"verify-badge\" style=\"display:none;\"><svg viewBox=\"0 0 24 24\" fill=\"#4d9eff\" stroke=\"#fff\" stroke-width=\"1\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 12l3 3 5-6\" stroke=\"#fff\" stroke-width=\"2\" fill=\"none\"/></svg></span>" + c.slice(closeH1+5);
  count++;
}

const old2 = "<div class=\"verify-pill\">";
if (c.includes(old2)) {
  c = c.split(old2).join("<div class=\"verify-pill\" id=\"profile-verify-pill\" onclick=\"purchaseVerification()\" style=\"display:none;\">");
  count++;
}

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
