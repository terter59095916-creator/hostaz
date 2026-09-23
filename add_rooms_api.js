const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `app.get('/api/game-rooms', (req, res) => {
    const list = [];
    for (const room of rooms.values()) {
        let male = 0, female = 0;
        room.players.forEach(p => { if (p.male) male++; else female++; });
        list.push({ id: room.gameId, total: room.players.size, male, female, max: MAX_SEATS });
    }
    list.sort((a, b) => a.id - b.id);
    res.json(list);
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
