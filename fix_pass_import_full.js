const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const marker1 = "app.get('/login-v2', (req, res) => {";
const idx1 = c.indexOf(marker1);
if (idx1 !== -1) {
  const alters = `try { db.exec("ALTER TABLE pass_level_rewards ADD COLUMN free_reward_type TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE pass_level_rewards ADD COLUMN free_booster TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE pass_level_rewards ADD COLUMN paid_reward_type TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE pass_level_rewards ADD COLUMN paid_booster TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE pass_level_rewards ADD COLUMN free_boosters_json TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE pass_level_rewards ADD COLUMN paid_boosters_json TEXT"); } catch(e) {}
`;
  c = c.slice(0, idx1) + alters + c.slice(idx1);
  count++;
}

const oldImport = "app.post('/api/temp-import-pass', (req, res) => {\n    const rows = req.body || [];\n    const del = db.prepare('DELETE FROM pass_level_rewards').run();\n    const ins = db.prepare('INSERT INTO pass_level_rewards (level, free_gold, paid_gold) VALUES (?, ?, ?)');\n    let count = 0;\n    rows.forEach(r => { ins.run(r.level, r.free_gold, r.paid_gold); count++; });\n    res.json({ deleted: del.changes, inserted: count });\n});";
if (c.includes(oldImport)) {
  const newImport = "app.post('/api/temp-import-pass', (req, res) => {\n    const rows = req.body || [];\n    const del = db.prepare('DELETE FROM pass_level_rewards').run();\n    const ins = db.prepare('INSERT INTO pass_level_rewards (level, free_gold, paid_gold, free_reward_type, free_booster, paid_reward_type, paid_booster, free_boosters_json, paid_boosters_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');\n    let cnt = 0;\n    rows.forEach(r => { ins.run(r.level, r.free_gold, r.paid_gold, r.free_reward_type || null, r.free_booster || null, r.paid_reward_type || null, r.paid_booster || null, r.free_boosters_json || null, r.paid_boosters_json || null); cnt++; });\n    res.json({ deleted: del.changes, inserted: cnt });\n});";
  c = c.split(oldImport).join(newImport);
  count++;
}

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
