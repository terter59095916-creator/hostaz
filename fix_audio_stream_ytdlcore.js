const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const old1 = "const ytsr = require('@distube/ytsr');";
if (c.includes(old1)) {
  c = c.split(old1).join(old1 + "\r\nconst ytdlcore = require('@distube/ytdl-core');");
}

const old2 = "const pipedInstances = ['https://pipedapi.kavin.rocks', 'https://api.piped.yt', 'https://pipedapi.adminforge.de', 'https://piped-api.lunar.icu', 'https://pipedapi.leptons.xyz'];\n        let audioUrl = null;\n        for (const inst of pipedInstances) {\n          try {\n            const pipedRes = await fetch(inst + '/streams/' + videoId, { signal: AbortSignal.timeout(5000) });\n            const pipedData = await pipedRes.json();\n            const audioStreams = (pipedData.audioStreams || []).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));\n            console.log('PIPED-TRY: ' + inst + ' audioStreams=' + audioStreams.length);\n            if (audioStreams[0] && audioStreams[0].url) { audioUrl = audioStreams[0].url; break; }\n          } catch (pipedErr) {\n            console.log('PIPED-INSTANCE-XETA: ' + inst + ' - ' + pipedErr.message);\n          }\n        }\n        if (!audioUrl) { res.status(500).send('no audio url'); return; }\n        res.redirect(audioUrl);";
const idx2 = c.indexOf(old2);
console.log("Tapildi:", idx2 !== -1);
if (idx2 !== -1) {
  const rep2 = "const info = await ytdlcore.getInfo('https://www.youtube.com/watch?v=' + videoId);\n        const format = ytdlcore.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });\n        console.log('YTDLCORE-FORMAT: ' + JSON.stringify({ itag: format.itag, mimeType: format.mimeType }));\n        res.set('Content-Type', format.mimeType.split(';')[0]);\n        ytdlcore.downloadFromInfo(info, { format }).pipe(res);";
  c = c.replace(old2, rep2);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
