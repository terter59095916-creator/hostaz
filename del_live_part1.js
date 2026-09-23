const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

// A: temp-check-live + livePhotos
const oldA = "app.get('/api/temp-check-live', (req, res) => {\n    const list = [];\n    liveStreamsMap.forEach((s) => {\n        const host = s.seats.get(s.hostId);\n        list.push({ id: s.id, name: host ? host.name : '', viewers: s.viewers.size, wsOpen: Boolean(host && host.ws.readyState === 1), pk: Boolean(s.pk) });\n    });\n    res.json(list);\n});\nconst livePhotosMap = new Map();\nlet nextLivePhotoId = 1;\napp.post('/api/live-photo-upload', authLib.requireUser, (req, res) => {\n    const { photo_data } = req.body || {};\n    if (!photo_data) return res.status(400).json({ error: 'no_photo' });\n    const photoId = nextLivePhotoId++;\n    livePhotosMap.set(photoId, photo_data);\n    setTimeout(() => livePhotosMap.delete(photoId), 4 * 60 * 60 * 1000);\n    res.json({ photo_url: '/api/live-photo/' + photoId });\n});\napp.get('/api/live-photo/:id', (req, res) => {\n    const data = livePhotosMap.get(Number(req.params.id));\n    if (!data) return res.status(404).send('not found');\n    const matches = data.match(/^data:(image\\/\\w+);base64,(.+)$/);\n    if (!matches) return res.status(400).send('invalid');\n    res.set('Content-Type', matches[1]);\n    res.send(Buffer.from(matches[2], 'base64'));\n});\n";
console.log("Found A:", c.includes(oldA));
c = c.replace(oldA, "");

// B: catalog declarations
const oldB = "const liveGiftEffectMap = new Map(require('./live-gift-effects.json').map(item => [String(item.gift_id), Number(item.effect_id)]));\nconst liveGiftCatalog = require('./tiktok_gift_catalog_full.json');\nconst liveGiftCatalogMap = new Map(liveGiftCatalog.map(gift => [String(gift.id), gift]));\nconst giftMediaEntitlements = new Map();\nconst giftMediaTickets = new Map();\nconst giftMediaRate = new Map();\nconst giftCatalogRate = new Map();\n";
console.log("Found B:", c.includes(oldB));
c = c.replace(oldB, "");

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE PART 1");
