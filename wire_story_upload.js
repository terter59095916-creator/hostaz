const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
let count = 0;

const old1 = "<a href=\"#\" class=\"add\">+ ÆlavÉ™ et</a>\n</div>\n<div class=\"stories\" id=\"stories-list\">\n<div class=\"story add-story\">";
if (c.includes(old1)) {
  c = c.split(old1).join("<a href=\"javascript:void(0)\" class=\"add\" onclick=\"triggerStoryUpload()\">+ ÆlavÉ™ et</a>\n</div>\n<input type=\"file\" id=\"story-upload-input\" accept=\"video/*\" style=\"display:none;\" onchange=\"handleStoryUpload(this)\">\n<div class=\"stories\" id=\"stories-list\">\n<div class=\"story add-story\" onclick=\"triggerStoryUpload()\">");
  count++;
}

console.log("Deyisdirilenler: " + count + "/1");
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
