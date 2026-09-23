const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = "<video id=\"sv-video\" controls autoplay playsinline></video>\n</div>\n</div>";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = `<video id="sv-video" controls autoplay playsinline></video>
<div class="sv-actions">
<button id="sv-like-btn" onclick="toggleStoryLike()" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;color:#fff;font-size:15px;">
<span id="sv-like-icon">🤍</span><span id="sv-like-count">0</span>
</button>
<span style="color:#fff;font-size:13px;opacity:.85;">💬 <span id="sv-comment-count">0</span> şərh</span>
</div>
<div class="sv-comments" id="sv-comments" style="max-height:120px;overflow-y:auto;padding:8px 4px;"></div>
<div class="sv-comment-input" style="display:flex;gap:8px;padding:8px 4px;">
<input type="text" id="sv-comment-text" placeholder="Şərh yaz..." maxlength="200" style="flex:1;border-radius:20px;border:1px solid #444;background:rgba(255,255,255,.08);color:#fff;padding:8px 14px;">
<button onclick="submitStoryComment()" style="border:none;background:var(--accent,#ff4d6d);color:#fff;border-radius:20px;padding:8px 16px;cursor:pointer;">Göndər</button>
</div>
</div>
</div>`;
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
