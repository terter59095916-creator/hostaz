const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "let profileUserAge = 18;\r\n        if (profileUser && profileUser.birthdate) {\r\n          try {\r\n            const bd2 = new Date(profileUser.birthdate);\r\n            const today2 = new Date();\r\n            profileUserAge = today2.getFullYear() - bd2.getFullYear();\r\n            const mDiff2 = today2.getMonth() - bd2.getMonth();\r\n            if (mDiff2 < 0 || (mDiff2 === 0 && today2.getDate() < bd2.getDate())) profileUserAge--;\r\n          } catch (e) {}\r\n        }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "let profileUserAge = 18;\r\n        if (profileUser && profileUser.age) {\r\n          profileUserAge = profileUser.age;\r\n        } else if (profileUser && profileUser.birthdate) {\r\n          try {\r\n            const bd2 = new Date(profileUser.birthdate);\r\n            const today2 = new Date();\r\n            profileUserAge = today2.getFullYear() - bd2.getFullYear();\r\n            const mDiff2 = today2.getMonth() - bd2.getMonth();\r\n            if (mDiff2 < 0 || (mDiff2 === 0 && today2.getDate() < bd2.getDate())) profileUserAge--;\r\n          } catch (e) {}\r\n        }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
