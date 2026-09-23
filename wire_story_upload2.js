const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "<a href=\"#\" class=\"add\">";
if (c.includes(old1)) {
  c = c.split(old1).join("<a href=\"javascript:void(0)\" class=\"add\" onclick=\"triggerStoryUpload()\">");
  count++;
}

const old2 = "<div class=\"story add-story\">";
if (c.includes(old2)) {
  c = c.split(old2).join("<div class=\"story add-story\" onclick=\"triggerStoryUpload()\">");
  count++;
}

const old3 = "<div class=\"stories\" id=\"stories-list\">";
if (c.includes(old3)) {
  c = c.split(old3).join("<input type=\"file\" id=\"story-upload-input\" accept=\"video/*\" style=\"display:none;\" onchange=\"handleStoryUpload(this)\">\n<div class=\"stories\" id=\"stories-list\">");
  count++;
}

console.log("Deyisdirilenler: " + count + "/3");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
