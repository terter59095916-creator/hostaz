const fs = require("fs");
const path = "C:\\bottle-server\\game_v2\\preloader_new.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const exitSvg = `<?xml version="1.0" encoding="utf-8"?><svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="36" height="36" viewBox="0 0 36 36" xml:space="preserve"><path fill="#FFFFFF" d="M15 8H9a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6v-3H9V11h6V8z"/><path fill="#FFFFFF" d="M24.5 13l-2.1 2.1 2.9 2.9H13v3h12.3l-2.9 2.9 2.1 2.1 6.5-6.5z"/></svg>`;
const exitB64 = Buffer.from(exitSvg, "utf8").toString("base64");

const old1 = "class SettingsButton extends HeaderButton {";
console.log("Found anchor1:", c.includes(old1));
const new1 = "const ui_btn_exitinline_namespaceObject = \"data:image/svg+xml;base64," + exitB64 + "\";\nclass ExitButton extends HeaderButton {\n  constructor(animationLayer) {\n    super(animationLayer, new SVGIcon(ui_btn_exitinline_namespaceObject));\n  }\n}\nclass SettingsButton extends HeaderButton {";
c = c.replace(old1, new1);

const old2 = "this.btnSettings = new SettingsButton(this);";
console.log("Found anchor2:", c.includes(old2));
const new2 = "this.btnSettings = new SettingsButton(this);\r\n    this.btnExit = new ExitButton(this);";
c = c.replace(old2, new2);

const old3 = "this.buttonsContainer.addChild(this.btnBottlePass, this.btnRoulette, this.btnLeague, this.btnMiscMenu, this.btnSettings, this.btnFullscreen);";
console.log("Found anchor3:", c.includes(old3));
const new3 = "this.buttonsContainer.addChild(this.btnBottlePass, this.btnRoulette, this.btnLeague, this.btnMiscMenu, this.btnSettings, this.btnFullscreen, this.btnExit);";
c = c.replace(old3, new3);

const old4 = "tableView.btnSettings.setOnClick(() => this.settings.show());";
console.log("Found anchor4:", c.includes(old4));
const new4 = "tableView.btnSettings.setOnClick(() => this.settings.show());\r\n    tableView.btnExit.setOnClick(() => { window.location.href = '/profile_v2'; });";
c = c.replace(old4, new4);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
