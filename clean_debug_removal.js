const fs = require('fs');
const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');

const startMarker = '<script>\n(function() {';
const startIdx = content.indexOf(startMarker);
if (startIdx === -1) { console.log('BASLANGIC TAPILMADI'); process.exit(1); }

const endMarker = '\n})();\n</script>';
const endIdx = content.indexOf(endMarker, startIdx);
if (endIdx === -1) { console.log('SON TAPILMADI'); process.exit(1); }

const cleanScript = `<script>
(function() {
  var audioUnlocked = false;
  function unlockAudioOnce() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      var unlockCtx = new AC();
      var buffer = unlockCtx.createBuffer(1, 1, 22050);
      var src = unlockCtx.createBufferSource();
      src.buffer = buffer;
      src.connect(unlockCtx.destination);
      src.start ? src.start(0) : src.noteOn(0);
      unlockCtx.resume && unlockCtx.resume();
    } catch (e) {}
    document.removeEventListener('touchend', unlockAudioOnce, true);
    document.removeEventListener('click', unlockAudioOnce, true);
  }
  document.addEventListener('touchend', unlockAudioOnce, true);
  document.addEventListener('click', unlockAudioOnce, true);

  var OrigAC = window.AudioContext || window.webkitAudioContext;
  if (OrigAC) {
    var cachedCtx = null;
    var WrappedAC = function() {
      if (cachedCtx && cachedCtx.state !== 'closed') {
        if (cachedCtx.state === 'suspended' || cachedCtx.state === 'interrupted') {
          cachedCtx.resume && cachedCtx.resume().catch(function() {});
        }
        return cachedCtx;
      }
      var ctx = new OrigAC();
      cachedCtx = ctx;
      return ctx;
    };
    window.__forceResume = function() {
      if (cachedCtx) {
        cachedCtx.resume && cachedCtx.resume();
      } else {
        var TmpAC = window.AudioContext || window.webkitAudioContext;
        var tmp = new TmpAC();
        tmp.resume && tmp.resume();
      }
    };
    var forceBtn = document.createElement('button');
    forceBtn.textContent = 'MAHNINI BASLAT';
    forceBtn.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:999997;background:#ff7a00;color:white;border:none;padding:12px 22px;border-radius:24px;font-weight:bold;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.4);';
    forceBtn.addEventListener('touchend', function(e) { e.preventDefault(); window.__forceResume(); }, true);
    forceBtn.addEventListener('click', function() { window.__forceResume(); }, true);
    document.documentElement.appendChild(forceBtn);
    window.AudioContext = WrappedAC;
    window.webkitAudioContext = WrappedAC;
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden && cachedCtx && (cachedCtx.state === 'suspended' || cachedCtx.state === 'interrupted')) {
        cachedCtx.resume && cachedCtx.resume();
      }
    });
  }
})();
</script>`;

content = content.slice(0, startIdx) + cleanScript + content.slice(endIdx + endMarker.length);
fs.writeFileSync(path, content, 'utf8');
console.log('TEMIZLENDI');
