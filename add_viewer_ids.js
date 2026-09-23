const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const existingSeats = [];\n    stream.seats.forEach(s => { if (s.userId !== wsUser.id) existingSeats.push({ user_id: String(s.userId), name: s.name, photo: s.photo, has_camera: s.hasCamera, photo_data: s.photoData }); });\n    ws.send(encodeMessage({ type: \x27live_seat_joined_self\x27, stream_id: stream.id, existing_seats: existingSeats, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const rep = "const existingSeats = [];\n    stream.seats.forEach(s => { if (s.userId !== wsUser.id) existingSeats.push({ user_id: String(s.userId), name: s.name, photo: s.photo, has_camera: s.hasCamera, photo_data: s.photoData }); });\n    const existingViewerIds = [];\n    stream.viewers.forEach((uid) => existingViewerIds.push(String(uid)));\n    ws.send(encodeMessage({ type: \x27live_seat_joined_self\x27, stream_id: stream.id, existing_seats: existingSeats, existing_viewer_ids: existingViewerIds, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));";
  c = c.replace(old, rep);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
