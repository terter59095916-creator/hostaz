const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const startMarker = "function getPlayerParams(embeddedPlayerSupported, frameWidth, frameHeight, chatWidth, chatX) {";
const endMarker = "function getLayout(";
const startIdx = c.indexOf(startMarker);
const endIdx = c.indexOf(endMarker);
console.log("start:", startIdx, "end:", endIdx);
if (startIdx !== -1 && endIdx !== -1) {
  const original = "function getPlayerParams(embeddedPlayerSupported, frameWidth, frameHeight, chatWidth, chatX) {\n  const isPortrait = frameWidth <= frameHeight;\n  const isLarge = isPortrait ? frameWidth > 600 : frameHeight > 800;\n  let position = isPortrait ? \x27portrait\x27 : \x27center\x27;\n  if (!isPortrait && embeddedPlayerSupported) {\n    return {\n      position: \x27embedded\x27,\n      isLarge: false,\n      width: chatWidth,\n      height: Math.min(chatWidth / 1.77, frameHeight * 0.27),\n      x: chatX,\n      y: 0\n    };\n  }\n  if (!isPortrait) {\n    if (isLarge && chatWidth < 470) position = embeddedPlayerSupported ? \x27embedded\x27 : \x27right\x27;else if (isLarge && chatWidth >= 470 && chatWidth < 650) position = \x27right\x27;else if (isLarge && chatWidth >= 650) position = \x27center\x27;else if (!isLarge && chatWidth < 375) position = embeddedPlayerSupported ? \x27embedded\x27 : \x27right\x27;else if (!isLarge && chatWidth >= 375 && chatWidth < 550) position = \x27right\x27;else if (!isLarge && chatWidth >= 550) position = \x27center\x27;\n  }\n  return {\n    position,\n    isLarge,\n    x: 0,\n    y: 0,\n    width: 0,\n    height: 0\n  };\n}\n";
  c = c.substring(0, startIdx) + original + c.substring(endIdx);
  fs.writeFileSync(path, c, "utf8");
  console.log("BERPA-OLUNDU");
}
