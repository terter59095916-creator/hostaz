const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "app.get('/login-v2', (req, res) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newRoute = `const livePhotosMap = new Map();
let nextLivePhotoId = 1;
app.post('/api/live-photo-upload', authLib.requireUser, (req, res) => {
    const { photo_data } = req.body || {};
    if (!photo_data) return res.status(400).json({ error: 'no_photo' });
    const photoId = nextLivePhotoId++;
    livePhotosMap.set(photoId, photo_data);
    setTimeout(() => livePhotosMap.delete(photoId), 4 * 60 * 60 * 1000);
    res.json({ photo_url: '/api/live-photo/' + photoId });
});
app.get('/api/live-photo/:id', (req, res) => {
    const data = livePhotosMap.get(Number(req.params.id));
    if (!data) return res.status(404).send('not found');
    const matches = data.match(/^data:(image\\/\\w+);base64,(.+)$/);
    if (!matches) return res.status(400).send('invalid');
    res.set('Content-Type', matches[1]);
    res.send(Buffer.from(matches[2], 'base64'));
});
`;
c = c.slice(0, idx) + newRoute + c.slice(idx);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
