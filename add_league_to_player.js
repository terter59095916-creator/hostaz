const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const myPlayer = { id: myId, name: myName, male: myMale, photo_url: wsUser && wsUser.avatar_data ? (\x27/api/avatar/\x27 + wsUser.id) : \x27\x27, seat: mySeat, kisses: 0, vip: wsUser ? Boolean(wsUser.is_vip) : false, pass_premium: wsUser ? Boolean(wsUser.is_vip) : false, top: myIsTop, frame: wsUser ? (wsUser.active_frame || \x27\x27) : \x27\x27, stone: wsUser ? (wsUser.active_stone || \x27\x27) : \x27\x27 };";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const tierOrderListMP = [\x27wood\x27, \x27rock\x27, \x27iron\x27, \x27steel\x27, \x27bronze\x27, \x27marble\x27, \x27silver\x27, \x27gold\x27, \x27platinum\x27, \x27amber\x27, \x27amethyst\x27, \x27topaz\x27, \x27pearls\x27, \x27sapphire\x27, \x27ruby\x27, \x27emerald\x27, \x27diamond\x27];\n      let myLeagueMP = 1;\n      if (wsUser) {\n        const tierNameMP = wsUser.league_tier || \x27bronze\x27;\n        myLeagueMP = tierOrderListMP.indexOf(tierNameMP);\n        if (myLeagueMP < 1) myLeagueMP = 1;\n      }\n      const myPlayer = { id: myId, name: myName, male: myMale, photo_url: wsUser && wsUser.avatar_data ? (\x27/api/avatar/\x27 + wsUser.id) : \x27\x27, seat: mySeat, kisses: 0, vip: wsUser ? Boolean(wsUser.is_vip) : false, pass_premium: wsUser ? Boolean(wsUser.is_vip) : false, top: myIsTop, frame: wsUser ? (wsUser.active_frame || \x27\x27) : \x27\x27, stone: wsUser ? (wsUser.active_stone || \x27\x27) : \x27\x27, league: myLeagueMP };";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
