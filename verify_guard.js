const fs = require("fs");
const files = ["game_v2/preloader_new.js", "butilochka.cdnvideo.ru/bottle/html/preloader.7e3c34e16b36.js"];
files.forEach(f => {
  const c = fs.readFileSync(f, "utf8");
  const first300 = c.substring(0, 300);
  const badPattern = String.fromCharCode(91) + "www";
  console.log(f + " -> problem varmi: " + first300.includes(badPattern));
});
