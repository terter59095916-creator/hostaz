const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const oldD = "app.get('/api/live-rtc-config', authLib.requireUser, requireSameSiteBrowser, (req, res) => {\n    const iceServers = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }];\n    if (process.env.LIVE_TURN_URL && process.env.LIVE_TURN_USERNAME && process.env.LIVE_TURN_CREDENTIAL) {\n        iceServers.push({\n            urls: process.env.LIVE_TURN_URL.split(',').map(value => value.trim()).filter(Boolean),\n            username: process.env.LIVE_TURN_USERNAME,\n            credential: process.env.LIVE_TURN_CREDENTIAL\n        });\n    }\n    res.set('Cache-Control', 'no-store, private');\n    res.json({ iceServers });\n});\napp.get('/api/live/list', authLib.requireUser, (req, res) => {\n    const list = [];\n    liveStreamsMap.forEach((stream) => {\n      const host = stream.seats.get(stream.hostId);\n      list.push({ stream_id: stream.id, host_id: stream.hostId, host_name: host ? host.name : '',\n        viewer_count: stream.viewers.size, mode: stream.mode, pk_active: Boolean(stream.pk) });\n    });\n    res.json(list);\n});\n";
console.log("Found D:", c.includes(oldD));
c = c.replace(oldD, "");

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE PART 3");
