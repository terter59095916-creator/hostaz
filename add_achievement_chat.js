const fs = require("fs");
const path = "C:\\bottle-server\\game_v2\\preloader_new.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "chatPresenter.onachievement = (receiver, achievement) => this.achievement.showAchievement(receiver, achievement);";
console.log("Found:", c.includes(old1));

const new1 = "chatPresenter.onachievement = (receiver, achievement) => {\r\n      this.achievement.showAchievement(receiver, achievement);\r\n      try {\r\n        const __achName = (achievement && (achievement.name || achievement.title)) || 'nailiyyet';\r\n        chatPresenter.chatMessage(receiver, undefined, `\\uD83C\\uDFC6 Yeni nailiyyet aldi etdi: ${__achName}`, Date.now());\r\n      } catch (e) {}\r\n    };";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
