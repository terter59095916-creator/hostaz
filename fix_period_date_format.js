const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "function getPeriodStart(period) {\r\n          const now = new Date();\r\n          if (period === \x27daily\x27) {\r\n            return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();\r\n          } else if (period === \x27weekly\x27) {\r\n            const day = now.getDay();\r\n            const diff = now.getDate() - day + (day === 0 ? -6 : 1);\r\n            return new Date(now.getFullYear(), now.getMonth(), diff).toISOString();\r\n          } else if (period === \x27monthly\x27) {\r\n            return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();\r\n          }\r\n          return null;\r\n        }";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "function toSqliteDateFormat(d) {\r\n          return d.toISOString().replace(\x27T\x27, \x27 \x27).replace(\x27Z\x27, \x27\x27).split(\x27.\x27)[0];\r\n        }\r\n        function getPeriodStart(period) {\r\n          const now = new Date();\r\n          if (period === \x27daily\x27) {\r\n            return toSqliteDateFormat(new Date(now.getFullYear(), now.getMonth(), now.getDate()));\r\n          } else if (period === \x27weekly\x27) {\r\n            const day = now.getDay();\r\n            const diff = now.getDate() - day + (day === 0 ? -6 : 1);\r\n            return toSqliteDateFormat(new Date(now.getFullYear(), now.getMonth(), diff));\r\n          } else if (period === \x27monthly\x27) {\r\n            return toSqliteDateFormat(new Date(now.getFullYear(), now.getMonth(), 1));\r\n          }\r\n          return null;\r\n        }";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
