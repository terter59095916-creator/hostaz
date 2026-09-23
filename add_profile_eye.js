const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "<input type=\"password\" id=\"settings-pw-current\" placeholder=\"hazırkı şifrən\">";
if (c.includes(old1)) {
  c = c.split(old1).join("<div style=\"position:relative;\"><input type=\"password\" id=\"settings-pw-current\" placeholder=\"hazırkı şifrən\" style=\"width:100%; padding-right:36px; box-sizing:border-box;\"><button type=\"button\" onclick=\"toggleEyeProfile(\x27settings-pw-current\x27, this)\" style=\"position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; opacity:.55;\">👁</button></div>");
  count++;
}

const old2 = "<input type=\"password\" id=\"settings-pw-new\" placeholder=\"ən azı 6 simvol\">";
if (c.includes(old2)) {
  c = c.split(old2).join("<div style=\"position:relative;\"><input type=\"password\" id=\"settings-pw-new\" placeholder=\"ən azı 6 simvol\" style=\"width:100%; padding-right:36px; box-sizing:border-box;\"><button type=\"button\" onclick=\"toggleEyeProfile(\x27settings-pw-new\x27, this)\" style=\"position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; opacity:.55;\">👁</button></div>");
  count++;
}

const marker = "async function changePassword() {";
const idx = c.indexOf(marker);
if (idx !== -1) {
  const fn = "function toggleEyeProfile(id, btn) {\nconst input = document.getElementById(id);\nconst isPw = input.type === \x27password\x27;\ninput.type = isPw ? \x27text\x27 : \x27password\x27;\nbtn.style.opacity = isPw ? \x271\x27 : \x27.55\x27;\n}\n" + marker;
  c = c.replace(marker, fn);
  count++;
}

console.log("Deyisdirilenler: " + count + "/3");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
