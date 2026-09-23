const fs = require("fs");
const path = "C:\\bottle-server\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const oldFetch = "fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(textToTranslate), { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } })\r\n      .then(r => r.json())\r\n      .then(data => {\r\n        let translated = '';\r\n        try { translated = data[0].map(part => part[0]).join(''); } catch (e) { translated = textToTranslate; }";
console.log("Found:", c.includes(oldFetch));

const newFetch = "fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(textToTranslate) + '&langpair=' + encodeURIComponent('auto|' + targetLang))\r\n      .then(r => r.json())\r\n      .then(data => {\r\n        let translated = '';\r\n        try { translated = data.responseData.translatedText; if (!translated) translated = textToTranslate; } catch (e) { translated = textToTranslate; }";
c = c.replace(oldFetch, newFetch);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
