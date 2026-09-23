const fs = require("fs");

// CLIENT FIX
const cpath = "C:\\bottle-server\\game_v2\\preloader_new.js";
let cc = fs.readFileSync(cpath, "utf8");
console.log("CLIENT LEN BEFORE:", cc.length);
const cold = "translateText(text, req_id, lang) {\r\n    this.send({\r\n      type: 'translate',\r\n      req_id,\r\n      text,\r\n      lang\r\n    });\r\n  }";
console.log("Client found:", cc.includes(cold));
const cnew = "translateText(text, req_id, lang) {\r\n    this.send({\r\n      type: 'translate',\r\n      req_id,\r\n      text: btoa(unescape(encodeURIComponent(text))),\r\n      lang\r\n    });\r\n  }";
cc = cc.replace(cold, cnew);
fs.writeFileSync(cpath, cc, "utf8");
console.log("CLIENT LEN AFTER:", cc.length);

// SERVER FIX
const spath = "C:\\bottle-server\\server.js";
let sc = fs.readFileSync(spath, "utf8");
console.log("SERVER LEN BEFORE:", sc.length);
const sold = "const textToTranslate = String(msg.text || '').slice(0, 1000);";
console.log("Server found1:", sc.includes(sold));
const snew = "let textToTranslate = String(msg.text || '').slice(0, 1400);\r\n    try { textToTranslate = decodeURIComponent(escape(Buffer.from(textToTranslate, 'base64').toString('binary'))).slice(0, 1000); } catch (e) {}";
sc = sc.replace(sold, snew);

const sold2 = ".then(r => r.json())";
console.log("Server found2 (count):", (sc.match(/\.then\(r => r\.json\(\)\)/g) || []).length);
const snew2Fetch = "fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(textToTranslate), { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } })";
const soldFetch = "fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(textToTranslate))";
console.log("Server found fetch:", sc.includes(soldFetch));
sc = sc.replace(soldFetch, snew2Fetch);

fs.writeFileSync(spath, sc, "utf8");
console.log("SERVER LEN AFTER:", sc.length);
console.log("DONE");
