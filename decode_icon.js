const fs = require("fs");
const c = fs.readFileSync("C:\\bottle-server\\game_v2\\preloader_new.js", "utf8");
const idx = c.indexOf("const ui_btn_settingsinline_namespaceObject");
const line = c.substring(idx, c.indexOf(";", idx));
const b64match = line.match(/base64,([A-Za-z0-9+/=]+)/);
if (b64match) {
  const decoded = Buffer.from(b64match[1], "base64").toString("utf8");
  console.log(decoded);
} else {
  console.log("NOT FOUND, raw:", line.substring(0, 200));
}
