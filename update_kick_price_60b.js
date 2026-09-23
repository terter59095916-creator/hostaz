const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "if (!kickerCrystalsRow || (kickerCrystalsRow.crystals || 0) < 50) {";
if (c.includes(old1)) { c = c.split(old1).join("if (!kickerCrystalsRow || (kickerCrystalsRow.crystals || 0) < 60) {"); count++; }

const old2 = "db.prepare(\x27UPDATE users SET crystals = crystals - 50 WHERE id = ?\x27).run(wsUser.id);\n    const targetIdKO = Number(msg.user_id);";
if (c.includes(old2)) { c = c.split(old2).join("db.prepare(\x27UPDATE users SET crystals = crystals - 60 WHERE id = ?\x27).run(wsUser.id);\n    const targetIdKO = Number(msg.user_id);"); count++; }

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
