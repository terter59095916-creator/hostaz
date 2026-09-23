const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "    if (ws.gameRoom) {\n      removePlayerFromRoom(ws.gameRoom, ws);\n    }\n  });\n});";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "    if (ws.gameRoom) {\n      removePlayerFromRoom(ws.gameRoom, ws);\n    }\n    if (ws.liveStreamId) {\n      const s = liveStreamsMap.get(ws.liveStreamId);\n      if (s) {\n        s.viewers.forEach((uid, vws) => { try { vws.send(encodeMessage({ type: 'live_ended', stream_id: s.id, packet: vws.packetCounter=(vws.packetCounter||1000)+1 })); } catch(e) {} });\n        liveStreamsMap.delete(ws.liveStreamId);\n        console.log('WS: yayimci ayrildi, canli yayim bagladi - id=' + ws.liveStreamId);\n      }\n    }\n    if (ws.watchingStreamId) {\n      const s2 = liveStreamsMap.get(ws.watchingStreamId);\n      if (s2 && s2.viewers.has(ws)) {\n        s2.viewers.delete(ws);\n        try { s2.broadcasterWs.send(encodeMessage({ type: 'live_viewer_left', viewer_count: s2.viewers.size, packet: s2.broadcasterWs.packetCounter=(s2.broadcasterWs.packetCounter||1000)+1 })); } catch(e) {}\n      }\n    }\n  });\n});";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
