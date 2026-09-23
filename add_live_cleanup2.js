const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "removePlayerFromRoom(ws.gameRoom, ws);\r\n    }\r\n  });\r\n});";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "removePlayerFromRoom(ws.gameRoom, ws);\r\n    }\r\n    if (ws.liveStreamId) {\r\n      const s = liveStreamsMap.get(ws.liveStreamId);\r\n      if (s) {\r\n        s.viewers.forEach((uid, vws) => { try { vws.send(encodeMessage({ type: \x27live_ended\x27, stream_id: s.id, packet: vws.packetCounter=(vws.packetCounter||1000)+1 })); } catch(e) {} });\r\n        liveStreamsMap.delete(ws.liveStreamId);\r\n        console.log(\x27WS: yayimci ayrildi, canli yayim bagladi - id=\x27 + ws.liveStreamId);\r\n      }\r\n    }\r\n    if (ws.watchingStreamId) {\r\n      const s2 = liveStreamsMap.get(ws.watchingStreamId);\r\n      if (s2 && s2.viewers.has(ws)) {\r\n        s2.viewers.delete(ws);\r\n        try { s2.broadcasterWs.send(encodeMessage({ type: \x27live_viewer_left\x27, viewer_count: s2.viewers.size, packet: s2.broadcasterWs.packetCounter=(s2.broadcasterWs.packetCounter||1000)+1 })); } catch(e) {}\r\n      }\r\n    }\r\n  });\r\n});";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
