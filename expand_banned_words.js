const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const BANNED_WORDS = ['sik','sikim','siktir','yarrag','yarraq','amcik','orospu','qehbe','qehbeler','pic','goted','gotveren','ana sikim','anani','bacini','kopoglu','qancig','fahişe','fahishe','malaka','suka','blyad','pidor','xuy','ebun','pizda'];\nfunction containsBannedWord(text) {\n  if (!text) return false;\n  const lower = text.toLowerCase().replace(/[^a-zəöüğıçş\\s]/gi, '');\n  return BANNED_WORDS.some(w => lower.includes(w));\n}";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const BANNED_WORDS = ['sik','sikim','sikeyim','siktir','sikdir','yarrag','yarraq','yarrağ','amcik','amciq','amcık','orospu','orospucocugu','qehbe','qehbeler','qahbe','pic','pici','goted','gotveren','gotverin','ana sikim','anani','ananiseks','bacini','bacinisik','kopoglu','kopoglu','qancig','qanciq','fahişe','fahishe','malaka','suka','blyad','pidor','xuy','ebun','pizda','xarosho ebat','mudak','gandon','siktim','siktimin','yavshaq','yavşaq','deyyus','dəyyus','ipne','ibne','pezevenk','sittirolim','amina','amina qoyim','amina qoyum','anani sikim','bok','boq','gotu','gotoglan'];\nfunction normalizeForFilter(text) {\n  return (text || '').toLowerCase()\n    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/@/g, 'a').replace(/\\$/g, 's')\n    .replace(/[^a-zəöüğıçş\\s]/gi, '');\n}\nfunction containsBannedWord(text) {\n  if (!text) return false;\n  const normalized = normalizeForFilter(text);\n  const compact = normalized.replace(/\\s+/g, '');\n  return BANNED_WORDS.some(w => { const wc = w.replace(/\\s+/g, ''); return normalized.includes(w) || compact.includes(wc); });\n}";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
