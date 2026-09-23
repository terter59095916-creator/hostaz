const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },\n          body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=' + videoId, isAudioOnly: true, aFormat: 'mp3' })\n        });\n        const cobaltData = await cobaltRes.json();\n        console.log('COBALT-RESPONSE: ' + JSON.stringify(cobaltData));\n        if (!cobaltData.url) { res.status(500).send('no audio url'); return; }\n        res.redirect(cobaltData.url);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const pipedRes = await fetch('https://pipedapi.kavin.rocks/streams/' + videoId);\n        const pipedData = await pipedRes.json();\n        const audioStreams = (pipedData.audioStreams || []).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));\n        console.log('PIPED-RESPONSE: audioStreams=' + audioStreams.length);\n        if (!audioStreams[0] || !audioStreams[0].url) { res.status(500).send('no audio url'); return; }\n        res.redirect(audioStreams[0].url);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
