const fs = require("fs");
const path = "login_v2.html";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "body: JSON.stringify({ credential: response.credential })";
if (c.includes(old1)) {
  c = c.split(old1).join("body: JSON.stringify({ credential: response.credential, device_id: localStorage.getItem('deviceId') })");
  count++;
}

const old2 = "body: JSON.stringify(user)";
if (c.includes(old2)) {
  c = c.split(old2).join("body: JSON.stringify(Object.assign({}, user, { device_id: localStorage.getItem('deviceId') }))");
  count++;
}

const old3 = "body: JSON.stringify({ access_token: accessToken })";
if (c.includes(old3)) {
  c = c.split(old3).join("body: JSON.stringify({ access_token: accessToken, device_id: localStorage.getItem('deviceId') })");
  count++;
}

console.log("Deyisdirilenler: " + count + "/3");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
