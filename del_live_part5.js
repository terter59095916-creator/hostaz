const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\server.js";
const lines = fs.readFileSync(path, "utf8").split("\n");
console.log("TOTAL LINES BEFORE:", lines.length);

console.log("Line 3389 (check):", JSON.stringify(lines[3388]));
console.log("Line 3836 (check):", JSON.stringify(lines[3835]));

// Replace lines 3389 through 3836 (1-indexed) = indices 3388 through 3835 (0-indexed)
// with a single merged line.
const removedCount = 3836 - 3389 + 1;
lines.splice(3388, removedCount, "      } else if (msg.type === \x27user_kickout\x27) {");

fs.writeFileSync(path, lines.join("\n"), "utf8");
console.log("TOTAL LINES AFTER:", lines.length);
console.log("DONE PART 5 (BIG BLOCK REMOVED)");
