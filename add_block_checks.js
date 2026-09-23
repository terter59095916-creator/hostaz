const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const old1 = "const stream = liveStreamsMap.get(Number(msg.stream_id));\n    if (!stream) { ws.send(encodeMessage({ type: \x27live_error\x27, reason: \x27not_found\x27, packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); return; }\n    const viewerId = wsUser ? wsUser.id : (\x27guest_\x27 + Math.random().toString(36).slice(2));";
const idx1 = c.indexOf(old1);
console.log("join_live tapildi:", idx1 !== -1);
if (idx1 !== -1) {
  const rep1 = "const stream = liveStreamsMap.get(Number(msg.stream_id));\n    if (!stream) { ws.send(encodeMessage({ type: \x27live_error\x27, reason: \x27not_found\x27, packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); return; }\n    if (wsUser && stream.blockedUsers && stream.blockedUsers.has(wsUser.id)) { ws.send(encodeMessage({ type: \x27live_error\x27, reason: \x27blocked\x27, packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); return; }\n    const viewerId = wsUser ? wsUser.id : (\x27guest_\x27 + Math.random().toString(36).slice(2));";
  c = c.replace(old1, rep1);
}

const old2 = "if (!stream || !wsUser) return;\n    if (!msg.accept) {";
const idx2 = c.indexOf(old2);
console.log("respond_to_invite tapildi:", idx2 !== -1);
if (idx2 !== -1) {
  const rep2 = "if (!stream || !wsUser) return;\n    if (stream.blockedUsers && stream.blockedUsers.has(wsUser.id)) return;\n    if (!msg.accept) {";
  c = c.replace(old2, rep2);
}

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
