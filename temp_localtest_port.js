const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\game_v2\\preloader_new.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "web: socketFactory({\n          server: window.location.hostname\n        })";
console.log("Found:", c.includes(old1));

const new1 = "web: socketFactory({\n          server: window.location.hostname,\n          port: window.location.hostname === 'localhost' ? window.location.port : undefined\n        })";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE - MUVEQQETIDIR");
