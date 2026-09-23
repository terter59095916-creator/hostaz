const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\server.js";
const lines = fs.readFileSync(path, "utf8").split("\n");
console.log("TOTAL LINES BEFORE:", lines.length);

console.log("Check line 3004:", JSON.stringify(lines[3003]));
console.log("Check line 3037:", JSON.stringify(lines[3036]));

// Change line 3004 (index 3003) to just close braces, remove the else-if start
lines[3003] = "        }}";
// Remove lines 3005 through 3036 (indices 3004 through 3035)
lines.splice(3004, 3036 - 3005 + 1);

fs.writeFileSync(path, lines.join("\n"), "utf8");
console.log("TOTAL LINES AFTER:", lines.length);
console.log("Check new line at index 3004:", JSON.stringify(lines[3004]));
console.log("DONE PART 6");
