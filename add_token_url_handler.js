const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = "} catch (err) {\ncconsole.error('Profil yuklenmedi:', err);\n}\n}\nloadProfile();";
const oldReal = "} catch (err) {\nconsole.error('Profil yuklenmedi:', err);\n}\n}\nloadProfile();";
const idx = c.indexOf(oldReal);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "} catch (err) {\nconsole.error('Profil yuklenmedi:', err);\n}\n}\n(function() {\nconst urlParams = new URLSearchParams(window.location.search);\nconst extToken = urlParams.get('t');\nif (extToken) {\nlocalStorage.setItem('authToken', extToken);\ndocument.cookie = 'authToken=' + extToken + '; path=/; max-age=' + (60*60*24*30);\nwindow.history.replaceState({}, document.title, window.location.pathname);\n}\n})();\nloadProfile();";
  c = c.replace(oldReal, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
