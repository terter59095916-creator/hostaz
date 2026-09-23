const fs = require("fs");
const path = "game_v2/preloader_new.js";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "userKick(user_id) {\n    const paid = this.viewer.viewer.decCurrency('gold', this.kickout.price);\n    if (!paid) return false;\n    this.send({\n      type: 'user_kickout',\n      user_id,\n      expected_price: this.kickout.price\n    });\n    return true;\n  }";
if (c.includes(old1)) {
  const rep1 = "userKick(user_id) {\n    this.send({\n      type: 'user_kickout',\n      user_id,\n      expected_price: this.kickout.price\n    });\n    return true;\n  }";
  c = c.replace(old1, rep1);
  count++;
}

const old2 = "userSave(user_id, save_referrer) {\n    const paid = this.viewer.viewer.decCurrency('gold', this.kickout.price);\n    if (!paid) return false;\n    this.send({\n      type: 'user_save',\n      user_id,\n      save_referrer,\n      expected_price: this.kickout.price\n    });\n    return true;\n  }";
if (c.includes(old2)) {
  const rep2 = "userSave(user_id, save_referrer) {\n    this.send({\n      type: 'user_save',\n      user_id,\n      save_referrer,\n      expected_price: this.kickout.price\n    });\n    return true;\n  }";
  c = c.replace(old2, rep2);
  count++;
}

console.log("Deyisdirilenler: " + count + "/2");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
