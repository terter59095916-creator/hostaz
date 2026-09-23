const fs = require('fs');
const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');

const hookScript = `
  var _origLog = console.log, _origWarn = console.warn, _origErr = console.error;
  var keywordRe = /video|clip|play|media|mp4|hls|stream|youtube|yt\.player|embed/i;
  function hookConsole(fn, tag, color) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      var text = args.map(function(a) { try { return typeof a === "object" ? JSON.stringify(a) : String(a); } catch(e) { return String(a); } }).join(" ");
      if (keywordRe.test(text)) {
        addLine(tag + ": " + text.slice(0, 200), color);
      }
      fn.apply(console, args);
    };
  }
  console.log = hookConsole(_origLog, "LOG", "#0f0");
  console.warn = hookConsole(_origWarn, "WARN", "#fa0");
  console.error = hookConsole(_origErr, "ERR", "#f55");
`;

content = content.replace(
  "  addLine('"'"'Debug basladi.",
  hookScript + "\n  addLine('"'"'Debug basladi."
);

fs.writeFileSync(path, content, 'utf8');
console.log('Console hook elave edildi');
