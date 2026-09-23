const fs = require("fs");
const path = "login_v2.html";
let c = fs.readFileSync(path, "utf8");
const count = (c.match(/id="telegram-login-container[^"]*"/g) || []).length;
console.log("Tapilan sayi: " + count);
c = c.split("display:flex; justify-content:center; margin-top:10px;").join("display:none; justify-content:center; margin-top:10px;");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
