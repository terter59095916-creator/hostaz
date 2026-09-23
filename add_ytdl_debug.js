const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const info = await ytdlcore.getInfo('https://www.youtube.com/watch?v=' + videoId);\n        const format = ytdlcore.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const rep = "const info = await ytdlcore.getInfo('https://www.youtube.com/watch?v=' + videoId);\n        console.log('YTDLCORE-FORMATS-COUNT: ' + (info.formats ? info.formats.length : 'undefined'));\n        if (info.formats && info.formats.length > 0) {\n          console.log('YTDLCORE-FIRST-FORMAT: ' + JSON.stringify({ itag: info.formats[0].itag, hasAudio: info.formats[0].hasAudio, hasVideo: info.formats[0].hasVideo, mimeType: info.formats[0].mimeType, url: info.formats[0].url ? 'VAR' : 'YOXDUR' }));\n        }\n        const format = ytdlcore.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });";
  c = c.replace(old, rep);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
