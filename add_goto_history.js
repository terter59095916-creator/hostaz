const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "} else if (msg.type === 'goto_specific_room') {";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "} else if (msg.type === 'goto_specific_room' || msg.type === 'goto_history' || msg.type === 'goto_view_table') {\n        if (msg.type !== 'goto_specific_room') msg.room_id = msg.game_id;";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
