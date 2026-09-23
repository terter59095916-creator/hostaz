const fs = require("fs");
const path = "login_v2.html";
let c = fs.readFileSync(path, "utf8");
const idx = c.indexOf("autocomplete=\"username\" required>");
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const lineStart = c.lastIndexOf("<input", idx);
  const lineEnd = c.indexOf(">", idx) + 1;
  const oldLine = c.substring(lineStart, lineEnd);
  console.log("Kohne setir:", JSON.stringify(oldLine));
  const newLine = "<input type=\"text\" placeholder=\"istifadeci adi veya ID\" autocomplete=\"username\" required>";
  c = c.substring(0, lineStart) + newLine + c.substring(lineEnd);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
