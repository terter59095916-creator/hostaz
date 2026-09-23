const fs = require("fs");
const files = ["game_v2/preloader_new.js", "butilochka.cdnvideo.ru/bottle/html/preloader.7e3c34e16b36.js"];
const badGuardMarker = "[www.ureyimsen.com](https://www.ureyimsen.com)";
const goodGuard = "(function(){var allowed=[\x27ureyimsen.com\x27,\x27www.ureyimsen.com\x27,\x27localhost\x27,\x27127.0.0.1\x27];var h=window.location.hostname;var ok=allowed.some(function(a){return h===a||h.endsWith(\x27.\x27+a);});if(!ok){document.body.innerHTML=\x27<div style=\"display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#888;text-align:center;padding:20px;\">Bu icerik yalniz ureyimsen.com saytinda goruntulenebilir.</div>\x27;throw new Error(\x27unauthorized_domain\x27);}})();\r\n";

files.forEach(f => {
  let c = fs.readFileSync(f, "utf8");
  const badIdx = c.indexOf(badGuardMarker);
  if (badIdx !== -1) {
    const guardStart = c.indexOf("(function(){var allowed=");
    const endMarker = "})();\r\n";
    const endIdx = c.indexOf(endMarker, badIdx) + endMarker.length;
    c = c.slice(0, guardStart) + goodGuard + c.slice(endIdx);
    fs.writeFileSync(f, c, "utf8");
    console.log(f + ": DUZELDILDI");
  } else {
    console.log(f + ": TAPILMADI (baxilmali)");
  }
});
