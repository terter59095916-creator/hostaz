const fs = require('fs');
const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');

const anchor = 'document.documentElement.appendChild(box);';
const hookScript = anchor + '\n  var _origCreateElement = document.createElement.bind(document);\n  var trackedVideos = [];\n  document.createElement = function(tag) {\n    var el = _origCreateElement(tag);\n    if (String(tag).toLowerCase() === "video") {\n      trackedVideos.push(el);\n      addLine("VIDEO EL YARADILDI (sayi=" + trackedVideos.length + ")", "#0ff");\n      el.addEventListener("error", function() { addLine("VIDEO ERROR code=" + (el.error ? el.error.code : "?") + " msg=" + (el.error ? el.error.message : "?"), "#f55"); });\n      el.addEventListener("play", function() { addLine("VIDEO play() cagirildi", "#0f0"); });\n      el.addEventListener("playing", function() { addLine("VIDEO playing (real basladi)", "#0f0"); });\n      el.addEventListener("pause", function() { addLine("VIDEO pause oldu", "#fa0"); });\n      el.addEventListener("canplay", function() { addLine("VIDEO canplay", "#0af"); });\n      el.addEventListener("stalled", function() { addLine("VIDEO stalled", "#f55"); });\n      el.addEventListener("suspend", function() { addLine("VIDEO suspend", "#fa0"); });\n      el.addEventListener("waiting", function() { addLine("VIDEO waiting (buffer)", "#fa0"); });\n      el.addEventListener("loadeddata", function() { addLine("VIDEO loadeddata", "#0af"); });\n    }\n    return el;\n  };\n  setInterval(function() {\n    trackedVideos.forEach(function(v, i) {\n      addLine("TV[" + i + "] paused=" + v.paused + " rs=" + v.readyState + " ns=" + v.networkState + " t=" + v.currentTime.toFixed(1) + " attached=" + document.contains(v), "#ff0");\n    });\n  }, 3000);';

content = content.replace(anchor, hookScript);
fs.writeFileSync(path, content, 'utf8');
console.log('OK');
