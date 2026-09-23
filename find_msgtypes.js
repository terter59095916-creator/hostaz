const fs = require("fs");
const lines = fs.readFileSync("C:\\bottle-server-kiraye\\server.js", "utf8").split("\n");
for (let i = 3385; i < 4000; i++) {
  if (lines[i] && lines[i].includes("msg.type ===")) {
    console.log((i+1) + ": " + lines[i].trim().substring(0, 80));
  }
}
