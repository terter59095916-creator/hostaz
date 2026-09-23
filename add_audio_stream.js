const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "const ytsr = require('@distube/ytsr');";
if (c.includes(old1)) {
  c = c.split(old1).join(old1 + "\r\nconst playdl = require('play-dl');");
  count++;
}

const marker2 = "app.get('/api/ciliz-music/search'";
const idx2 = c.indexOf(marker2);
if (idx2 !== -1) {
  const newRoute = `app.get('/api/audio-stream/:videoId', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const streamInfo = await playdl.stream('https://www.youtube.com/watch?v=' + videoId, { quality: 0 });
        res.set('Content-Type', streamInfo.type || 'audio/webm');
        streamInfo.stream.pipe(res);
    } catch (err) {
        console.log('AUDIO-STREAM-XETA: ' + err.message);
        res.status(500).send('audio stream error');
    }
});
`;
  c = c.slice(0, idx2) + newRoute + c.slice(idx2);
  count++;
}

const old3 = "return {\n              artist: (item.author && item.author.name) || \x27\x27,\n              duration: durSec,\n              id: videoId,\n              title: item.title,\n              url: item.url,\n              provider: \x27cz\x27\n            };";
if (c.includes(old3)) {
  const rep3 = "return {\n              artist: (item.author && item.author.name) || \x27\x27,\n              duration: durSec,\n              id: videoId,\n              title: item.title,\n              url: \x27/api/audio-stream/\x27 + videoId,\n              provider: \x27cz\x27\n            };";
  c = c.split(old3).join(rep3);
  count++;
}

console.log("Deyisdirilenler: " + count + "/3");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
