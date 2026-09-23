const fs = require('fs');

const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');

const debugScript = `
<script>
(function() {
  var box = document.createElement('div');
  box.id = 'ios-debug-overlay';
  box.style.cssText = 'position:fixed;top:0;left:0;right:0;max-height:40vh;overflow-y:auto;background:rgba(0,0,0,0.85);color:#0f0;font:10px monospace;z-index:999999;padding:6px;white-space:pre-wrap;word-break:break-all;';
  var closeBtn = document.createElement('div');
  closeBtn.textContent = '[X BAGLA]';
  closeBtn.style.cssText = 'color:#f55;font-weight:bold;margin-bottom:4px;';
  closeBtn.onclick = function() { box.style.display = 'none'; };
  box.appendChild(closeBtn);
  var log = document.createElement('div');
  box.appendChild(log);
  document.documentElement.appendChild(box);

  function addLine(txt, color) {
    var line = document.createElement('div');
    line.textContent = txt;
    if (color) line.style.color = color;
    log.appendChild(line);
    box.scrollTop = box.scrollHeight;
  }

  window.addEventListener('error', function(e) {
    addLine('ERROR: ' + e.message + ' @ ' + (e.filename || '?') + ':' + (e.lineno || '?'), '#f55');
  });
  window.addEventListener('unhandledrejection', function(e) {
    addLine('PROMISE REJECT: ' + (e.reason && e.reason.message || e.reason), '#fa5');
  });

  addLine('Debug basladi. UA: ' + navigator.userAgent.slice(0, 60), '#5cf');
  addLine('Ekran: ' + window.innerWidth + 'x' + window.innerHeight + ' orient=' + (screen.orientation ? screen.orientation.type : '?'), '#5cf');

  setInterval(function() {
    var vids = document.querySelectorAll('video');
    var iframes = document.querySelectorAll('iframe');
    addLine('[' + new Date().toLocaleTimeString() + '] video=' + vids.length + ' iframe=' + iframes.length, '#888');
    vids.forEach(function(v, i) {
      addLine('  video[' + i + ']: paused=' + v.paused + ' readyState=' + v.readyState + ' error=' + (v.error ? v.error.code : 'yox') + ' src=' + (v.src || v.currentSrc || '').slice(-40), '#0f0');
    });
    iframes.forEach(function(f, i) {
      addLine('  iframe[' + i + ']: src=' + (f.src || '').slice(-50), '#0af');
    });
  }, 3000);
})();
</script>
`;

content = content.replace('<head>', '<head>' + debugScript);
fs.writeFileSync(path, content, 'utf8');
console.log('Debug overlay elave edildi');
