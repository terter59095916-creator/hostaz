const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "console.log(`recv: ${jsonData}`);\n      const json = JSON.parse(jsonData);\n      this.onrecv(json);";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "console.log(`recv: ${jsonData}`);\n      const json = JSON.parse(jsonData);\n      if (json.type === \x27game_enter\x27 && !window.__tableUrlHandled) {\n        window.__tableUrlHandled = true;\n        try {\n          const params = new URLSearchParams(window.location.search);\n          const tableParam = params.get(\x27table\x27);\n          if (tableParam) {\n            setTimeout(() => { try { this.send({ type: \x27goto_specific_room\x27, room_id: Number(tableParam) }); } catch(e) {} }, 400);\n          }\n        } catch(e) {}\n      }\n      this.onrecv(json);";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
