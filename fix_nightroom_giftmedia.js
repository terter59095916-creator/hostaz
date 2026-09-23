const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "function grantNightRoomGiftMedia(roomId, effectId) {\n  if (!effectId) return;\n  const members = nightRoomMembers.get(roomId);\n  if (!members) return;\n  const expires = Date.now() + 25000;\n  members.forEach(member => giftMediaEntitlements.set(giftMediaKey(member.userId, effectId), expires));\n}";
console.log("Found:", c.includes(old1));

const new1 = "function grantNightRoomGiftMedia(roomId, effectId) {\n  // Canli yayim hediyye-media sistemi silindiyi ucun bu funksiya artiq hec ne etmir (tehlukesiz no-op).\n  return;\n}";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE - FIXED");
