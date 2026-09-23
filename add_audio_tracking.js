const fs = require('fs');
const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  "var vids = document.querySelectorAll('video');\n    var iframes = document.querySelectorAll('iframe');",
  "var vids = document.querySelectorAll('video');\n    var iframes = document.querySelectorAll('iframe');\n    var auds = document.querySelectorAll('audio');"
);
content = content.replace(
  "addLine('[' + new Date().toLocaleTimeString() + '] video=' + vids.length + ' iframe=' + iframes.length, '#888');",
  "addLine('[' + new Date().toLocaleTimeString() + '] video=' + vids.length + ' iframe=' + iframes.length + ' audio=' + auds.length, '#888');\n    auds.forEach(function(a, i) {\n      addLine('  audio[' + i + ']: paused=' + a.paused + ' rs=' + a.readyState + ' err=' + (a.error ? a.error.code : 'yox') + ' muted=' + a.muted + ' vol=' + a.volume, '#ff0');\n    });"
);
fs.writeFileSync(path, content, 'utf8');
console.log('Audio izleme elave edildi');
