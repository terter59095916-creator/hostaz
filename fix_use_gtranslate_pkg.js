const fs = require("fs");
const path = "C:\\bottle-server\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

// Add require at top (after another require line)
const oldReq = "const compression = require('compression');";
console.log("Found require anchor:", c.includes(oldReq));
const newReq = "const compression = require('compression');\r\nconst { translate: googleTranslateLib } = require('@vitalets/google-translate-api');";
c = c.replace(oldReq, newReq);

// Replace the fetch-based block with the package-based one
const oldBlock = "fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(textToTranslate) + '&langpair=' + encodeURIComponent('auto|' + targetLang))\r\n      .then(r => r.json())\r\n      .then(data => {\r\n        let translated = '';\r\n        try { translated = data.responseData.translatedText; if (!translated) translated = textToTranslate; } catch (e) { translated = textToTranslate; }\r\n        try { ws.send(encodeMessage({ type: 'translate', ttext: translated, req_id: reqId, packet: nextPacket(ws) })); } catch (e) {}\r\n      })\r\n      .catch(err => {\r\n        console.log('WS: translate xetasi -', err.message);\r\n        try { ws.send(encodeMessage({ type: 'translate', ttext: textToTranslate, req_id: reqId, packet: nextPacket(ws) })); } catch (e) {}\r\n      });";
console.log("Found block:", c.includes(oldBlock));

const newBlock = "googleTranslateLib(textToTranslate, { to: targetLang })\r\n      .then(res => {\r\n        const translated = (res && res.text) ? res.text : textToTranslate;\r\n        try { ws.send(encodeMessage({ type: 'translate', ttext: translated, req_id: reqId, packet: nextPacket(ws) })); } catch (e) {}\r\n      })\r\n      .catch(err => {\r\n        console.log('WS: translate xetasi -', err.message);\r\n        try { ws.send(encodeMessage({ type: 'translate', ttext: textToTranslate, req_id: reqId, packet: nextPacket(ws) })); } catch (e) {}\r\n      });";
c = c.replace(oldBlock, newBlock);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
