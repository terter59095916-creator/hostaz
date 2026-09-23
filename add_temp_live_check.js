const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/temp-check-live', (req, res) => {
    const list = [];
    liveStreamsMap.forEach((s) => {
        list.push({ id: s.id, name: s.broadcasterName, viewers: s.viewers.size, wsOpen: s.broadcasterWs.readyState === 1 });
    });
    res.json(list);
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
