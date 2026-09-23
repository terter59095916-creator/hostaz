const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const marker1 = "function addDailyLeagueScore(userId, amount) {";
const idx1 = c.indexOf(marker1);
console.log("addDailyLeagueScore tapildi:", idx1 !== -1);
if (idx1 !== -1) {
  const helperFunc = "function addKissLeagueScore(userId, amount) {\r\n  const today = new Date().toISOString().slice(0, 10);\r\n  const row = db.prepare('SELECT daily_kiss_league_points, daily_kiss_league_limit, daily_kiss_limit_date FROM users WHERE id = ?').get(userId);\r\n  if (!row) return 0;\r\n  let currentPoints = row.daily_kiss_league_points || 0;\r\n  let currentLimit = row.daily_kiss_league_limit || 20;\r\n  if (row.daily_kiss_limit_date !== today) {\r\n    currentPoints = 0;\r\n    currentLimit = 20;\r\n    db.prepare('UPDATE users SET daily_kiss_league_points = 0, daily_kiss_league_limit = 20, daily_kiss_limit_date = ? WHERE id = ?').run(today, userId);\r\n  }\r\n  const remaining = Math.max(0, currentLimit - currentPoints);\r\n  const actualAdd = Math.min(amount, remaining);\r\n  if (actualAdd > 0) {\r\n    db.prepare('UPDATE users SET daily_kiss_league_points = daily_kiss_league_points + ? WHERE id = ?').run(actualAdd, userId);\r\n    addDailyLeagueScore(userId, actualAdd);\r\n  }\r\n  return actualAdd;\r\n}\r\n" + marker1;
  c = c.replace(marker1, helperFunc);
}

const old2 = "if (msg.item === \x27league_kiss_lim10\x27) addDailyLeagueScore(wsUser.id, 10);";
const idx2 = c.indexOf(old2);
console.log("league_kiss_lim10 tapildi:", idx2 !== -1);
if (idx2 !== -1) {
  const rep2 = "if (msg.item === \x27league_kiss_lim10\x27) {\r\n              const todayLim = new Date().toISOString().slice(0, 10);\r\n              const limRow = db.prepare(\x27SELECT daily_kiss_limit_date, daily_kiss_league_limit FROM users WHERE id = ?\x27).get(wsUser.id);\r\n              if (limRow && limRow.daily_kiss_limit_date === todayLim) {\r\n                db.prepare(\x27UPDATE users SET daily_kiss_league_limit = daily_kiss_league_limit + 10 WHERE id = ?\x27).run(wsUser.id);\r\n              } else {\r\n                db.prepare(\x27UPDATE users SET daily_kiss_league_points = 0, daily_kiss_league_limit = 30, daily_kiss_limit_date = ? WHERE id = ?\x27).run(todayLim, wsUser.id);\r\n              }\r\n            }\r\n            if (msg.item === \x27refuse_slap\x27) { ws.refuseSlapActive = true; }";
  c = c.replace(old2, rep2);
}

fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
