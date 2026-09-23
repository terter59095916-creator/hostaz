const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "app.get('/api/audio-stream/:videoId', async (req, res) => {\n    try {\n        const videoId = req.params.videoId;\n        console.log('AUDIO-STREAM-DEBUG: videoId=' + videoId);\n        const yt = await getInnertube();\n        const stream = await yt.download(videoId, { type: 'audio', quality: 'best', format: 'mp4' });\n        res.set('Content-Type', 'audio/mp4');\n        const reader = stream.getReader();\n        const pump = () => reader.read().then(({ done, value }) => {\n          if (done) { res.end(); return; }\n          res.write(Buffer.from(value));\n          pump();\n        }).catch(e => { console.log('AUDIO-STREAM-PUMP-XETA: ' + e.message); res.end(); });\n        pump();\n    } catch (err) {\n        console.log('AUDIO-STREAM-XETA: ' + err.message + ' stack=' + err.stack);\n        res.status(500).send('audio stream error');\n    }\n});";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "app.get('/api/audio-stream/:videoId', async (req, res) => {\n    try {\n        const videoId = req.params.videoId;\n        console.log('AUDIO-STREAM-DEBUG: videoId=' + videoId);\n        const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },\n          body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=' + videoId, isAudioOnly: true, aFormat: 'mp3' })\n        });\n        const cobaltData = await cobaltRes.json();\n        console.log('COBALT-RESPONSE: ' + JSON.stringify(cobaltData));\n        if (!cobaltData.url) { res.status(500).send('no audio url'); return; }\n        res.redirect(cobaltData.url);\n    } catch (err) {\n        console.log('AUDIO-STREAM-XETA: ' + err.message);\n        res.status(500).send('audio stream error');\n    }\n});";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
