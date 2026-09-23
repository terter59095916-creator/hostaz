const fs = require("fs");
const files = [
  { path: "game_v2/preloader_new.js", eol: "\n" },
  { path: "butilochka.cdnvideo.ru/bottle/html/preloader.7e3c34e16b36.js", eol: "\r\n" }
];

function seasonBlock(eol) {
  return "const tableDecor = session.scheduledGifts.find(s => !!assetsJSON.table_decor[s.id]);" + eol +
    "    if (tableDecor) {" + eol +
    "      tableView.setTableDecor(assetsJSON.table_decor[tableDecor.id]);" + eol +
    "    } else if (assetsJSON.table_decor && assetsJSON.table_decor.table_summer) {" + eol +
    "      tableView.setTableDecor(assetsJSON.table_decor.table_summer);" + eol +
    "    }";
}
function newSeasonBlock(eol) {
  return "const tableDecor = session.scheduledGifts.find(s => !!assetsJSON.table_decor[s.id]);" + eol +
    "    if (tableDecor) {" + eol +
    "      tableView.setTableDecor(assetsJSON.table_decor[tableDecor.id]);" + eol +
    "    } else {" + eol +
    "      const _m = new Date().getMonth();" + eol +
    "      const _season = (_m===11||_m===0||_m===1) ? \x27table_winter\x27 : (_m>=2&&_m<=4) ? \x27table_spring\x27 : (_m>=5&&_m<=7) ? \x27table_summer\x27 : \x27table_autumn\x27;" + eol +
    "      if (assetsJSON.table_decor && assetsJSON.table_decor[_season]) tableView.setTableDecor(assetsJSON.table_decor[_season]);" + eol +
    "    }";
}

files.forEach(({path, eol}) => {
  let c = fs.readFileSync(path, "utf8");
  const old = seasonBlock(eol);
  const idx = c.indexOf(old);
  console.log(path + " tapildi: " + (idx !== -1));
  if (idx !== -1) {
    c = c.replace(old, newSeasonBlock(eol));
    fs.writeFileSync(path, c, "utf8");
    console.log(path + ": YAZILDI");
  }
});
