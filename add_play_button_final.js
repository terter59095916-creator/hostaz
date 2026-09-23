const fs = require('fs');
const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');

const anchor = 'window.AudioContext = WrappedAC;';
const btnScript = 'window.__forceResume = function() {\n      if (cachedCtx) {\n        cachedCtx.resume && cachedCtx.resume();\n        addLine("Play duymesi ile resume, state=" + cachedCtx.state, "#0ff");\n      } else {\n        var TmpAC = window.AudioContext || window.webkitAudioContext;\n        var tmp = new TmpAC();\n        tmp.resume && tmp.resume();\n        addLine("Play duymesi: cachedCtx yox idi, yeni yaradildi", "#fa0");\n      }\n    };\n    var forceBtn = document.createElement("button");\n    forceBtn.textContent = "\u25B6 Mahnini Baslat";\n    forceBtn.style.cssText = "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:999997;background:#ff7a00;color:white;border:none;padding:12px 22px;border-radius:24px;font-weight:bold;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.4);";\n    forceBtn.addEventListener("touchend", function(e) { e.preventDefault(); window.__forceResume(); }, true);\n    forceBtn.addEventListener("click", function() { window.__forceResume(); }, true);\n    document.documentElement.appendChild(forceBtn);\n    ' + anchor;

content = content.replace(anchor, btnScript);

content = content.replace(
  "box.style.cssText = 'position:fixed;top:0;left:0;right:0;max-height:40vh;overflow-y:auto;background:rgba(0,0,0,0.85);color:#0f0;font:10px monospace;z-index:999999;padding:6px;white-space:pre-wrap;word-break:break-all;';",
  "box.style.cssText = 'position:fixed;top:0;left:0;right:0;max-height:40vh;overflow-y:auto;background:rgba(0,0,0,0.85);color:#0f0;font:10px monospace;z-index:999999;padding:6px;white-space:pre-wrap;word-break:break-all;pointer-events:none;';"
);
content = content.replace(
  "closeBtn.style.cssText = 'color:#f55;font-weight:bold;margin-bottom:4px;';",
  "closeBtn.style.cssText = 'color:#f55;font-weight:bold;margin-bottom:4px;pointer-events:auto;display:inline-block;';"
);

fs.writeFileSync(path, content, 'utf8');
console.log('OK');
