const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "function isKickedFromRoom(userId, gameId) {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const helper = "function getActiveStatus(user) {\r\n  if (!user || !user.user_status) return \x27\x27;\r\n  if (!user.user_status_set_at) return user.user_status;\r\n  const setAt = new Date(user.user_status_set_at);\r\n  const hoursSince = (Date.now() - setAt.getTime()) / (1000 * 60 * 60);\r\n  return hoursSince < 24 ? user.user_status : \x27\x27;\r\n}\r\n" + marker;
  c = c.replace(marker, helper);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
