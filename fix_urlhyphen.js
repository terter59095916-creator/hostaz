const fs = require("fs");
const path = "C:\\bottle-server\\game_v2\\preloader_new.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "window.location.href = '/profile_v2' + (__tok ? ('?t=' + encodeURIComponent(__tok)) : '');";
console.log("Found:", c.includes(old1));

const new1 = "window.location.href = '/profile-v2' + (__tok ? ('?t=' + encodeURIComponent(__tok)) : '');";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
