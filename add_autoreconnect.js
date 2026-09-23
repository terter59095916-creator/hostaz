const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\game_v2\\preloader_new.js";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "this.socket.onclose = function () {\n      let e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n      var _a;\n      return (_a = _this.onerror) === null || _a === void 0 ? void 0 : _a.call(_this);\n    };";
console.log("Found:", c.includes(old1));

const new1 = "this.socket.onclose = function () {\n      let e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n      var _a;\n      if (e && e.code && e.code !== 1000) {\n        return (_a = _this.onerror) === null || _a === void 0 ? void 0 : _a.call(_this, new Error('auto_reconnect'));\n      }\n      return (_a = _this.onerror) === null || _a === void 0 ? void 0 : _a.call(_this);\n    };";
c = c.replace(old1, new1);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
