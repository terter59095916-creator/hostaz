const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const licenseComment = `/*
 * ===================================================================
 * BU SKRIPT ureyimsen.com SAYTINA MEXSUSDUR
 * Bu kod, ureyimsen.com terefinden aylik icareye verilib.
 * Icazesiz kopyalanmasi, satilmasi ve ya yenidenpaylanmasi qadagandir.
 * © ureyimsen.com - Butun huquqlar qorunur.
 * ===================================================================
 */
`;
if (!c.startsWith("/*")) {
  c = licenseComment + c;
  fs.writeFileSync(path, c, "utf8");
  console.log("Lisenziya bildirisi elave edildi (server.js basi)");
}

const marker = "server.listen(PORT, () => {";
const idx = c.indexOf(marker);
if (idx !== -1) {
  const consoleNotice = marker + "\r\n    console.log(\x27=====================================\x27);\r\n    console.log(\x27Bu skript ureyimsen.com saytina mexsusdur.\x27);\r\n    console.log(\x27Aylik icareye verilib. Icazesiz istifade qadagandir.\x27);\r\n    console.log(\x27=====================================\x27);";
  c = c.replace(marker, consoleNotice);
  fs.writeFileSync(path, c, "utf8");
  console.log("Baslangicda gorunen bildiris elave edildi");
}
