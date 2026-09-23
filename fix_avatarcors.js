const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "if (!user || !user.avatar_data) return res.status(404).send('No avatar');\r\n    if (user.avatar_data.startsWith('http://') || user.avatar_data.startsWith('https://')) {\r\n        return res.redirect(user.avatar_data);\r\n    }";
console.log("Found:", c.includes(old1));

const new1 = "if (!user || !user.avatar_data || user.avatar_data.includes('no_profil')) return res.status(404).send('No avatar');\r\n    if (user.avatar_data.startsWith('http://') || user.avatar_data.startsWith('https://')) {\r\n        return res.redirect(user.avatar_data);\r\n    }";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
