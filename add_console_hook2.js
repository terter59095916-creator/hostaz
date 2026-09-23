const fs = require('fs');
const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');

const anchor = 'document.documentElement.appendChild(box);';
const hookScript = anchor + '\n  var _origLog = console.log, _origWarn = console.warn, _origErr = console.error;\n  var keywordRe = /video|clip|play|media|mp4|hls|stream|youtube|embed/i;\n  function hookConsole(fn, tag, color) {\n    return function() {\n      var args = Array.prototype.slice.call(arguments);\n      var text = args.map(function(a) { try { return typeof a === "object" ? JSON.stringify(a) : String(a); } catch(e) { return String(a); } }).join(" ");\n      if (keywordRe.test(text)) { addLine(tag + ": " + text.slice(0, 200), color); }\n      fn.apply(console, args);\n    };\n  }\n  console.log = hookConsole(_origLog, "LOG", "#0f0");\n  console.warn = hookConsole(_origWarn, "WARN", "#fa0");\n  console.error = hookConsole(_origErr, "ERR", "#f55");';

content = content.replace(anchor, hookScript);
fs.writeFileSync(path, content, 'utf8');
console.log('OK');
