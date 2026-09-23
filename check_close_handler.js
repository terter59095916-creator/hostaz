const c = require("fs").readFileSync("server.js", "utf8");
const idx = c.indexOf("removePlayerFromRoom(ws.gameRoom, ws);\n    }\n  });");
console.log("idx:", idx);
if (idx !== -1) console.log(JSON.stringify(c.substring(idx-30, idx+80)));
else {
  const idx2 = c.lastIndexOf("removePlayerFromRoom(ws.gameRoom, ws);");
  console.log("son occurrence idx2:", idx2);
  console.log(JSON.stringify(c.substring(idx2, idx2+120)));
}
