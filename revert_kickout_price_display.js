const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const count = (c.match(/kickout_info: \{ price: 50/g) || []).length;
console.log("Tapilan sayi: " + count);
c = c.split("kickout_info: { price: 50").join("kickout_info: { price: 0");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
