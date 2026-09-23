const fs = require("fs");
const path = "C:\\bottle-server\\server.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "} else if (msg.type === 'block_user') {\r\n    const stream = liveStreamsMap.get(Number(msg.stream_id));\r\n    if (!stream || !wsUser || stream.hostId !== wsUser.id) return;";
console.log("Found:", c.includes(old1));

const new1 = "} else if (msg.type === 'translate') {\r\n    const reqId = msg.req_id;\r\n    const textToTranslate = String(msg.text || '').slice(0, 1000);\r\n    const targetLang = msg.lang || 'az';\r\n    if (!textToTranslate) return;\r\n    fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(textToTranslate))\r\n      .then(r => r.json())\r\n      .then(data => {\r\n        let translated = '';\r\n        try { translated = data[0].map(part => part[0]).join(''); } catch (e) { translated = textToTranslate; }\r\n        try { ws.send(encodeMessage({ type: 'translate', ttext: translated, req_id: reqId, packet: nextPacket(ws) })); } catch (e) {}\r\n      })\r\n      .catch(err => {\r\n        console.log('WS: translate xetasi -', err.message);\r\n        try { ws.send(encodeMessage({ type: 'translate', ttext: textToTranslate, req_id: reqId, packet: nextPacket(ws) })); } catch (e) {}\r\n      });\r\n} else if (msg.type === 'block_user') {\r\n    const stream = liveStreamsMap.get(Number(msg.stream_id));\r\n    if (!stream || !wsUser || stream.hostId !== wsUser.id) return;";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
