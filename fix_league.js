const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
const old = "_recv_league_start(obj) {\n    var _a;\n    if (!this.leagueInfo) return;\n    this.leagueInfo.state = 'running';\n    this.leagueInfo.startTs = this.serverTimer.ts(obj.start_ms);\n    this.leagueInfo.finishTs = this.serverTimer.ts(obj.finish_ms);\n    this.leagueInfo.users = obj.users;\n    this.leagueInfo.users.sort(leagueCompare);\n    this.onLeagueUpdate.emit();\n    (_a = this.dialogs) === null || _a === void 0 ? void 0 : _a.showLeagueStart();\n  }\n";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "_recv_league_start(obj) {\n    var _a;\n    if (!this.leagueInfo) return;\n    const wasRunning = this.leagueInfo.state === \x27running\x27;\n    this.leagueInfo.state = \x27running\x27;\n    this.leagueInfo.startTs = this.serverTimer.ts(obj.start_ms);\n    this.leagueInfo.finishTs = this.serverTimer.ts(obj.finish_ms);\n    this.leagueInfo.users = obj.users;\n    this.leagueInfo.users.sort(leagueCompare);\n    this.onLeagueUpdate.emit();\n    if (!wasRunning) { (_a = this.dialogs) === null || _a === void 0 ? void 0 : _a.showLeagueStart(); }\n  }\n";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
