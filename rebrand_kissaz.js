const fs = require("fs");
let count = 0;

let loginC = fs.readFileSync("login_v2.html", "utf8");
if (loginC.includes("<title>Ureyimsen — Giriş</title>")) { loginC = loginC.split("<title>Ureyimsen — Giriş</title>").join("<title>Kiss.az — Giriş</title>"); count++; }
if (loginC.includes("<h1>Ureyimsen</h1>")) { loginC = loginC.split("<h1>Ureyimsen</h1>").join("<h1>Kiss.az</h1>"); count++; }
fs.writeFileSync("login_v2.html", loginC, "utf8");

let profileC = fs.readFileSync("profile_v2.html", "utf8");
if (profileC.includes("<title>Ureyimsen — Profil</title>")) { profileC = profileC.split("<title>Ureyimsen — Profil</title>").join("<title>Kiss.az — Profil</title>"); count++; }
if (profileC.includes("<h3>Ureyimsen Canlı!</h3>")) { profileC = profileC.split("<h3>Ureyimsen Canlı!</h3>").join("<h3>Kiss.az Canlı!</h3>"); count++; }
fs.writeFileSync("profile_v2.html", profileC, "utf8");

console.log("Deyisdirilenler: " + count + "/4");
