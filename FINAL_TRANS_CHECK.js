const fs = require("fs");
console.log("=== SERVER.JS ===");
const s = fs.readFileSync("C:\\bottle-server\\server.js", "utf8");
console.log("translate handler:", s.includes("msg.type === 'translate'"));

console.log("=== PRELOADER_NEW.JS ===");
const p = fs.readFileSync("C:\\bottle-server\\game_v2\\preloader_new.js", "utf8");
console.log("supportsChatTranslation false count (should be 0):", (p.match(/this\.supportsChatTranslation = false;/g) || []).length);
console.log("supportsChatTranslation true count:", (p.match(/this\.supportsChatTranslation = true;/g) || []).length);
console.log("sender.locale gate removed:", !p.includes("if (!sender.locale) return false;"));
console.log("userLocale fallback:", p.includes("return this.p.userLocale || 'az';"));
console.log("Exit button still present:", p.includes("class ExitButton extends HeaderButton"));
