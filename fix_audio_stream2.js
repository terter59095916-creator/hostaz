const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "app.get('/api/audio-stream/:videoId', async (req, res) => {\n    try {\n        const videoId = req.params.videoId;\n        const streamInfo = await playdl.stream('https://www.youtube.com/watch?v=' + videoId, { quality: 0 });\n        res.set('Content-Type', streamInfo.type || 'audio/webm');\n        streamInfo.stream.pipe(res);\n    } catch (err) {\n        console.log('AUDIO-STREAM-XETA: ' + err.message);\n        res.status(500).send('audio stream error');\n    }\n});";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "app.get('/api/audio-stream/:videoId', async (req, res) => {\n    try {\n        const videoId = req.params.videoId;\n        const fullUrl = 'https://www.youtube.com/watch?v=' + videoId;\n        console.log('AUDIO-STREAM-DEBUG: url=' + fullUrl);\n        const streamInfo = await playdl.stream(fullUrl);\n        res.set('Content-Type', streamInfo.type || 'audio/webm');\n        streamInfo.stream.pipe(res);\n    } catch (err) {\n        console.log('AUDIO-STREAM-XETA: ' + err.message + ' stack=' + err.stack);\n        res.status(500).send('audio stream error');\n    }\n});";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
