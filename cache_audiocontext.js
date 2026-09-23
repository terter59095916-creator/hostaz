const fs = require('fs');
const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');

const oldCtor = 'var WrappedAC = function() {\n      var ctx = new OrigAC();';
const newCtor = 'var cachedCtx = null;\n    var WrappedAC = function() {\n      if (cachedCtx && cachedCtx.state !== "closed") {\n        addLine("AudioContext YENIDEN ISTIFADE (cached), state=" + cachedCtx.state, "#0ff");\n        if (cachedCtx.state === "suspended" || cachedCtx.state === "interrupted") {\n          cachedCtx.resume && cachedCtx.resume().then(function() { addLine("cached ctx.resume() basarili", "#0f0"); }).catch(function(e) { addLine("cached ctx.resume() xeta: " + e.message, "#f55"); });\n        }\n        return cachedCtx;\n      }\n      var ctx = new OrigAC();\n      cachedCtx = ctx;';

content = content.replace(oldCtor, newCtor);

content = content.replace(
  'window.AudioContext = WrappedAC;\n    window.webkitAudioContext = WrappedAC;',
  'window.AudioContext = WrappedAC;\n    window.webkitAudioContext = WrappedAC;\n    document.addEventListener("visibilitychange", function() {\n      if (!document.hidden && cachedCtx && (cachedCtx.state === "suspended" || cachedCtx.state === "interrupted")) {\n        cachedCtx.resume && cachedCtx.resume();\n        addLine("visibilitychange -> resume cehdi", "#0af");\n      }\n    });'
);

fs.writeFileSync(path, content, 'utf8');
console.log('OK');
