const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "const userIdToWs = new Map();";
const idx = c.indexOf(marker);
console.log("marker tapildi:", idx !== -1);
if (idx !== -1) {
  const addition = "const BANNED_WORDS = ['sik','sikim','sikeyim','siktir','sikdir','yarrag','yarraq','yarrağ','amcik','amciq','amcık','orospu','orospucocugu','qehbe','qehbeler','qahbe','pic','pici','got','goted','gotveren','gotverin','ana sikim','anani','ananiseks','bacini','bacinisik','kopoglu','qancig','qanciq','fahişe','fahishe','malaka','suka','blyad','pidor','xuy','ebun','pizda','mudak','gandon','siktim','siktimin','yavshaq','yavşaq','deyyus','dəyyus','ipne','ibne','pezevenk','sittirolim','amina','amina qoyim','amina qoyum','anani sikim','bok','boq','gotu','gotoglan'];\nfunction normalizeForFilter(text) {\n  return (text || '').toLowerCase()\n    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/@/g, 'a').replace(/\\$/g, 's')\n    .replace(/[^a-zəöüğıçş\\s]/gi, '');\n}\nfunction containsBannedWord(text) {\n  if (!text) return false;\n  const normalized = normalizeForFilter(text);\n  const compact = normalized.replace(/\\s+/g, '');\n  return BANNED_WORDS.some(w => { const wc = w.replace(/\\s+/g, ''); return normalized.includes(w) || compact.includes(wc); });\n}\nfunction containsPhoneNumber(text) {\n  if (!text) return false;\n  const cleaned = (text || '').replace(/[\\s\\-\\.\\(\\)]/g, '');\n  return /\\d{7,}/.test(cleaned);\n}\n" + marker;
  c = c.replace(marker, addition);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
