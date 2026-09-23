const fs = require('fs');
const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');

const anchor = 'document.documentElement.appendChild(box);';
const unlockScript = anchor + '\n  var audioUnlocked = false;\n  function unlockAudioOnce() {\n    if (audioUnlocked) return;\n    audioUnlocked = true;\n    try {\n      var AC = window.AudioContext || window.webkitAudioContext;\n      var unlockCtx = new AC();\n      var buffer = unlockCtx.createBuffer(1, 1, 22050);\n      var src = unlockCtx.createBufferSource();\n      src.buffer = buffer;\n      src.connect(unlockCtx.destination);\n      src.start ? src.start(0) : src.noteOn(0);\n      unlockCtx.resume && unlockCtx.resume();\n      addLine("AUDIO UNLOCK cehdi edildi (ilk toxunma)", "#0ff");\n    } catch (e) {\n      addLine("AUDIO UNLOCK XETA: " + e.message, "#f55");\n    }\n    document.removeEventListener("touchend", unlockAudioOnce, true);\n    document.removeEventListener("click", unlockAudioOnce, true);\n  }\n  document.addEventListener("touchend", unlockAudioOnce, true);\n  document.addEventListener("click", unlockAudioOnce, true);';

content = content.replace(anchor, unlockScript);
fs.writeFileSync(path, content, 'utf8');
console.log('OK');
