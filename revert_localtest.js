const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\game_v2\\preloader_new.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "this.secure = (typeof location === 'undefined' || location.hostname !== 'localhost');";
console.log("Found (to revert):", c.includes(old1));

const new1 = "this.secure = true;";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("GERI QAYTARILDI");
