const fs = require("fs");
const path = "C:\\bottle-server\\game_v2\\preloader_new.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "needsTranslation(sender, text) {\r\n    if (this.isTutorial) return false;\r\n    if (!this.ontranslate) return false;\r\n    const userLocale = this.userLocale;\r\n    if (!userLocale) return false;\r\n    if (!sender.locale) return false;\r\n    const detectLocale = (() => {";
console.log("Found:", c.includes(old1));

const new1 = "needsTranslation(sender, text) {\r\n    if (this.isTutorial) return false;\r\n    if (!this.ontranslate) return false;\r\n    const userLocale = this.userLocale;\r\n    if (!userLocale) return false;\r\n    const detectLocale = (() => {";
c = c.replace(old1, new1);

const old2 = "return !eqLocale(sender.locale, userLocale) || !eqLocale(detectLocale, userLocale);";
console.log("Found2:", c.includes(old2));
const new2 = "return !eqLocale(detectLocale, userLocale);";
c = c.replace(old2, new2);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
