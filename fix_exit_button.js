const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "queryCaps: () => Promise.resolve({}) };";
if (c.includes(old1)) {
  c = c.split(old1).join("queryCaps: () => Promise.resolve({}), logout: true };");
  count++;
}

const old2 = "social.logout ? [{\n        type: 'simple',\n        name: trans.translate('android:settings:logout'),\n        icon: 'exit',\n        action: () => session.viewerLogout()\n      }] : [],";
if (c.includes(old2)) {
  c = c.split(old2).join("social.logout ? [{\n        type: 'simple',\n        name: trans.translate('android:settings:logout'),\n        icon: 'exit',\n        action: () => { window.location.href = '/profile-v2'; }\n      }] : [],");
  count++;
}

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
