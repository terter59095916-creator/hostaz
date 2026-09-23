const fs = require('fs');
const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'if (String(tag).toLowerCase() === "video") {',
  'if (String(tag).toLowerCase() === "video" || String(tag).toLowerCase() === "audio") {'
);
content = content.replace(
  'addLine("VIDEO EL YARADILDI (sayi=" + trackedVideos.length + ")", "#0ff");',
  'addLine((String(tag).toUpperCase()) + " EL YARADILDI (sayi=" + trackedVideos.length + ")", "#0ff");'
);

fs.writeFileSync(path, content, 'utf8');
console.log('OK');
