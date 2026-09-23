const fs = require("fs");
const path = "C:\\bottle-server\\game_v2\\preloader_new.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "tableView.btnExit.setOnClick(() => { window.location.href = '/profile_v2'; });";
console.log("Found:", c.includes(old1));

const new1 = "tableView.btnExit.setOnClick(() => {\r\n      const __m = document.cookie.match(/(?:^|; )authToken=([^;]*)/);\r\n      const __tok = __m ? decodeURIComponent(__m[1]) : '';\r\n      window.location.href = '/profile_v2' + (__tok ? ('?t=' + encodeURIComponent(__tok)) : '');\r\n    });";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
