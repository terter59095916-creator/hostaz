const fs = require("fs");
const files = fs.readdirSync("C:\\bottle-server");
const suspicious = files.filter(f => f.includes("SYNTAX") || f.includes("TEMPtest") || f.trim() !== f || /[\u0080-\uffff]/.test(f));
console.log("Suspicious files found:", suspicious.length);
suspicious.forEach(f => {
  console.log("Deleting:", JSON.stringify(f));
  try {
    fs.unlinkSync("C:\\bottle-server\\" + f);
    console.log("  -> DELETED");
  } catch (e) {
    console.log("  -> FAILED:", e.message);
  }
});
