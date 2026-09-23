const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const pipedRes = await fetch('https://pipedapi.kavin.rocks/streams/' + videoId);\n        const pipedData = await pipedRes.json();\n        const audioStreams = (pipedData.audioStreams || []).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));\n        console.log('PIPED-RESPONSE: audioStreams=' + audioStreams.length);\n        if (!audioStreams[0] || !audioStreams[0].url) { res.status(500).send('no audio url'); return; }\n        res.redirect(audioStreams[0].url);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const pipedInstances = ['https://pipedapi.kavin.rocks', 'https://api.piped.yt', 'https://pipedapi.adminforge.de', 'https://piped-api.lunar.icu', 'https://pipedapi.leptons.xyz'];\n        let audioUrl = null;\n        for (const inst of pipedInstances) {\n          try {\n            const pipedRes = await fetch(inst + '/streams/' + videoId, { signal: AbortSignal.timeout(5000) });\n            const pipedData = await pipedRes.json();\n            const audioStreams = (pipedData.audioStreams || []).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));\n            console.log('PIPED-TRY: ' + inst + ' audioStreams=' + audioStreams.length);\n            if (audioStreams[0] && audioStreams[0].url) { audioUrl = audioStreams[0].url; break; }\n          } catch (pipedErr) {\n            console.log('PIPED-INSTANCE-XETA: ' + inst + ' - ' + pipedErr.message);\n          }\n        }\n        if (!audioUrl) { res.status(500).send('no audio url'); return; }\n        res.redirect(audioUrl);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
