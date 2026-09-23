const fs = require("fs");
const path = "C:\\bottle-server\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "app.get('/game-v2', (req, res) => {\r\n    res.sendFile(path.join(__dirname, 'game_v2', 'yandex_v2.html'));\r\n});";
console.log("Found:", c.includes(old1));

const new1 = "app.get('/game-v2', (req, res) => {\r\n    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');\r\n    res.set('Pragma', 'no-cache');\r\n    res.sendFile(path.join(__dirname, 'game_v2', 'yandex_v2.html'));\r\n});";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
