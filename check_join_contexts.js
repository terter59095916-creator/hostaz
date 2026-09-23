const fs = require("fs");
const c = fs.readFileSync("server.js", "utf8");
[
  "myRoom.players.set(ws, myPlayer);",
  "newRoom.players.set(ws, rejoinedPlayer);",
  "targetRoom.players.set(ws, rejoinedPlayerX);",
  "destRoom.players.set(ws, rejoinedPlayer2);"
].forEach(marker => {
  const idx = c.indexOf(marker);
  const before = c.substring(idx-150, idx);
  console.log("=== " + marker + " ===");
  console.log(JSON.stringify(before.slice(-100)));
});
