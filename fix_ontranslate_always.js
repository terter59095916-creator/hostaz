const fs = require("fs");
const path = "C:\\bottle-server\\game_v2\\preloader_new.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "chatPresenter.ontranslate = social.supportsChatTranslation ? (text, ts) => {\r\n      session.translateText(text, ts);\r\n    } : undefined;";
console.log("Found:", c.includes(old1));

const new1 = "chatPresenter.ontranslate = (text, ts) => {\r\n      session.translateText(text, ts);\r\n    };";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
