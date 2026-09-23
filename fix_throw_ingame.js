const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");

const old1 = "throwIfNotInGame(u) {\n    if (u === null || u === void 0 ? void 0 : u.game) return;\n    console.log(this.usersLog);\n    throw new Error(`User not in game: ${u === null || u === void 0 ? void 0 : u.id}`);\n  }";
const idx1 = c.indexOf(old1);
console.log("1-throwIfNotInGame tapildi:", idx1 !== -1);
if (idx1 !== -1) {
  const new1 = "throwIfNotInGame(u) {\n    if (u === null || u === void 0 ? void 0 : u.game) return true;\n    console.warn(\x27User not in game (skipping): \x27 + (u === null || u === void 0 ? void 0 : u.id));\n    return false;\n  }";
  c = c.replace(old1, new1);
}

const old2 = "this.passiveUser = this.users[obj.user.id];\n    this.throwIfNotInGame(this.passiveUser);\n    this.throwIfNotInGame(this.activeUser);\n    (_b = this.table) === null || _b === void 0 ? void 0 : _b.turnSelect(this.passiveUser);";
const idx2 = c.indexOf(old2);
console.log("2-game_turn tapildi:", idx2 !== -1);
if (idx2 !== -1) {
  const new2 = "this.passiveUser = this.users[obj.user.id];\n    if (!this.throwIfNotInGame(this.passiveUser) || !this.throwIfNotInGame(this.activeUser)) return;\n    (_b = this.table) === null || _b === void 0 ? void 0 : _b.turnSelect(this.passiveUser);";
  c = c.replace(old2, new2);
}

const old3 = "const u = this.users[obj.user.id];\n    this.throwIfNotInGame(u);\n    this.throwIfNotInGame(this.passiveUser);\n    this.throwIfNotInGame(this.activeUser);\n    (_a = this.table) === null || _a === void 0 ? void 0 : _a.kiss(u);";
const idx3 = c.indexOf(old3);
console.log("3-game_kiss tapildi:", idx3 !== -1);
if (idx3 !== -1) {
  const new3 = "const u = this.users[obj.user.id];\n    if (!this.throwIfNotInGame(u) || !this.throwIfNotInGame(this.passiveUser) || !this.throwIfNotInGame(this.activeUser)) return;\n    (_a = this.table) === null || _a === void 0 ? void 0 : _a.kiss(u);";
  c = c.replace(old3, new3);
}

const old4 = "const u = this.users[obj.user.id];\n    this.throwIfNotInGame(u);\n    this.throwIfNotInGame(this.passiveUser);\n    this.throwIfNotInGame(this.activeUser);\n    (_a = this.table) === null || _a === void 0 ? void 0 : _a.refuse(u);";
const idx4 = c.indexOf(old4);
console.log("4-game_refuse tapildi:", idx4 !== -1);
if (idx4 !== -1) {
  const new4 = "const u = this.users[obj.user.id];\n    if (!this.throwIfNotInGame(u) || !this.throwIfNotInGame(this.passiveUser) || !this.throwIfNotInGame(this.activeUser)) return;\n    (_a = this.table) === null || _a === void 0 ? void 0 : _a.refuse(u);";
  c = c.replace(old4, new4);
}

fs.writeFileSync(path, c, "utf8");
console.log("BITDI");
