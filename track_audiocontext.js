const fs = require('fs');
const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');

const anchor = 'document.documentElement.appendChild(box);';
const hookScript = anchor + '\n  var trackedCtxs = [];\n  var OrigAC = window.AudioContext || window.webkitAudioContext;\n  if (OrigAC) {\n    var WrappedAC = function() {\n      var ctx = new OrigAC();\n      trackedCtxs.push(ctx);\n      addLine("AudioContext yaradildi #" + trackedCtxs.length + " state=" + ctx.state + " sampleRate=" + ctx.sampleRate, "#0ff");\n      var origResume = ctx.resume.bind(ctx);\n      ctx.resume = function() {\n        addLine("ctx.resume() cagirildi, evvelki state=" + ctx.state, "#fa0");\n        return origResume().then(function() { addLine("ctx.resume() UGURLU yeni state=" + ctx.state, "#0f0"); }).catch(function(e) { addLine("ctx.resume() XETA: " + e.message, "#f55"); });\n      };\n      var origDecode = ctx.decodeAudioData.bind(ctx);\n      ctx.decodeAudioData = function(buf, ok, err) {\n        addLine("decodeAudioData cagirildi, bytes=" + (buf ? buf.byteLength : 0), "#0af");\n        return origDecode(buf).then(function(r) { addLine("decodeAudioData UGURLU dur=" + r.duration.toFixed(1), "#0f0"); if (ok) ok(r); return r; }).catch(function(e) { addLine("decodeAudioData XETA: " + e.message, "#f55"); if (err) err(e); throw e; });\n      };\n      return ctx;\n    };\n    window.AudioContext = WrappedAC;\n    window.webkitAudioContext = WrappedAC;\n  }\n  setInterval(function() {\n    trackedCtxs.forEach(function(c, i) {\n      addLine("CTX[" + i + "] state=" + c.state, "#ff0");\n    });\n  }, 3000);';

content = content.replace(anchor, hookScript);
fs.writeFileSync(path, content, 'utf8');
console.log('OK');
