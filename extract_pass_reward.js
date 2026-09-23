const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
const idx = c.indexOf("ownedItemsPass[rewardBoosterName] = true;");
const chunk = c.substring(idx-20, idx+120);
fs.writeFileSync("pass_reward_chunk.txt", JSON.stringify(chunk));
console.log("saved, idx=" + idx);
