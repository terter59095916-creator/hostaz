const fs = require("fs");
const files = ["game_v2/preloader_new.js", "butilochka.cdnvideo.ru/bottle/html/preloader.7e3c34e16b36.js"];
const guardStartMarker = "(function(){var allowed=";
const guardEndMarker = "unauthorized_domain";

const domain = "ureyimsen" + "." + "com";
const wwwDomain = "www" + "." + domain;
const goodGuard = "(function(){var allowed=[" +
  JSON.stringify(domain) + "," + JSON.stringify(wwwDomain) + "," +
  JSON.stringify("localhost") + "," + JSON.stringify("127.0.0.1") +
  "];var h=window.location.hostname;var ok=allowed.some(function(a){return h===a||h.endsWith(\x27.\x27+a);});if(!ok){document.body.innerHTML=\x27<div style=\"display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#888;text-align:center;padding:20px;\">Bu icerik yalniz " + domain + " saytinda goruntulenebilir.</div>\x27;throw new Error(\x27unauthorized_domain\x27);}})();\r\n";

files.forEach(f => {
  let c = fs.readFileSync(f, "utf8");
  const startIdx = c.indexOf(guardStartMarker);
  if (startIdx === -1) { console.log(f + ": BASLANGIC TAPILMADI"); return; }
  const endMarkerIdx = c.indexOf(guardEndMarker, startIdx);
  if (endMarkerIdx === -1) { console.log(f + ": SON TAPILMADI"); return; }
  const afterGuard = c.indexOf("\r\n", endMarkerIdx) + 2;
  c = c.slice(0, startIdx) + goodGuard + c.slice(afterGuard);
  fs.writeFileSync(f, c, "utf8");
  console.log(f + ": DUZELDILDI, yeni uzunluq=" + c.length);
});
