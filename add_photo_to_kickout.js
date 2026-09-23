const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");

const oldKicker = "kicker_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== \x27female\x27 }";
const newKicker = "kicker_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== \x27female\x27, photo_url: wsUser.avatar_data ? (\x27/api/avatar/\x27 + wsUser.id) : \x27\x27 }";
const c1 = (c.match(new RegExp(oldKicker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
c = c.split(oldKicker).join(newKicker);

const oldKicked = "kicked_user: { id: String(targetIdKO), name: targetPlayerKO.name, male: targetPlayerKO.male }";
const newKicked = "kicked_user: { id: String(targetIdKO), name: targetPlayerKO.name, male: targetPlayerKO.male, photo_url: targetPlayerKO.photo_url || \x27\x27 }";
const c2 = (c.match(new RegExp(oldKicked.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
c = c.split(oldKicked).join(newKicked);

const oldSaviour = "saviour_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== \x27female\x27 }";
const newSaviour = "saviour_user: { id: String(wsUser.id), name: wsUser.display_name || wsUser.username, male: wsUser.gender !== \x27female\x27, photo_url: wsUser.avatar_data ? (\x27/api/avatar/\x27 + wsUser.id) : \x27\x27 }";
const c3 = (c.match(new RegExp(oldSaviour.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
c = c.split(oldSaviour).join(newSaviour);

const oldSaved = "saved_user: { id: String(targetIdSave), name: savedPlayer ? savedPlayer.name : \x27\x27, male: savedPlayer ? savedPlayer.male : true }";
const newSaved = "saved_user: { id: String(targetIdSave), name: savedPlayer ? savedPlayer.name : \x27\x27, male: savedPlayer ? savedPlayer.male : true, photo_url: savedPlayer ? (savedPlayer.photo_url || \x27\x27) : \x27\x27 }";
const c4 = (c.match(new RegExp(oldSaved.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
c = c.split(oldSaved).join(newSaved);

console.log("kicker_user tapilan: " + c1 + ", kicked_user tapilan: " + c2 + ", saviour_user tapilan: " + c3 + ", saved_user tapilan: " + c4);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
