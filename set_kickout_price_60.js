const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const count = (c.match(/kickout_info: \{ price: 0/g) || []).length;
console.log("Tapilan sayi: " + count);
c = c.split("kickout_info: { price: 0").join("kickout_info: { price: 60");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
