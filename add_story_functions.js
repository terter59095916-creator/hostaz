const fs = require("fs");
const path = "profile_v2.html";
let c = fs.readFileSync(path, "utf8");
const old = fs.readFileSync("openstory_output.txt", "utf8");
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = `let currentStoryId = null;
function openStory(s) {
currentStoryId = s.id;
document.getElementById('sv-avatar').src = s.user.photo_url || 'https://i.pravatar.cc/100?u=' + s.user.id;
document.getElementById('sv-name').textContent = s.user.display_name || s.user.username;
document.getElementById('sv-caption').textContent = s.caption || '';
const video = document.getElementById('sv-video');
video.src = s.url;
document.getElementById('story-viewer').classList.add('open');
document.getElementById('sv-like-icon').textContent = s.liked_by_me ? '❤️' : '🤍';
document.getElementById('sv-like-count').textContent = s.likes_count || 0;
document.getElementById('sv-comment-count').textContent = s.comments_count || 0;
const token = localStorage.getItem('authToken');
fetch('/api/shorts/view/' + s.id, { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } }).catch(()=>{});
loadStoryComments(s.id);
}
async function loadStoryComments(shortId) {
const token = localStorage.getItem('authToken');
try {
const res = await fetch('/api/shorts/comments/' + shortId, { headers: { 'Authorization': 'Bearer ' + token } });
const comments = await res.json();
const box = document.getElementById('sv-comments');
box.innerHTML = comments.map(cm => \`<div style="color:#fff;font-size:13px;padding:4px 0;"><b>\${cm.user.display_name || cm.user.username}:</b> \${cm.text}</div>\`).join('');
box.scrollTop = box.scrollHeight;
} catch (e) {}
}
async function toggleStoryLike() {
if (!currentStoryId) return;
const token = localStorage.getItem('authToken');
try {
const res = await fetch('/api/shorts/like/' + currentStoryId, { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } });
const data = await res.json();
document.getElementById('sv-like-icon').textContent = data.liked ? '❤️' : '🤍';
const countEl = document.getElementById('sv-like-count');
countEl.textContent = Math.max(0, Number(countEl.textContent) + (data.liked ? 1 : -1));
} catch (e) {}
}
async function submitStoryComment() {
if (!currentStoryId) return;
const input = document.getElementById('sv-comment-text');
const text = input.value.trim();
if (!text) return;
const token = localStorage.getItem('authToken');
try {
const res = await fetch('/api/shorts/comment/' + currentStoryId, {
method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
body: JSON.stringify({ text })
});
if (res.ok) {
input.value = '';
loadStoryComments(currentStoryId);
const countEl = document.getElementById('sv-comment-count');
countEl.textContent = Number(countEl.textContent) + 1;
}
} catch (e) {}
}
function triggerStoryUpload() {
document.getElementById('story-upload-input').click();
}
async function handleStoryUpload(input) {
const file = input.files[0];
if (!file) return;
if (file.size > 50 * 1024 * 1024) { alert('Video 50 MB-dan boyuk ola bilmez.'); input.value = ''; return; }
const videoEl = document.createElement('video');
videoEl.preload = 'metadata';
videoEl.onloadedmetadata = function() {
window.URL.revokeObjectURL(videoEl.src);
if (videoEl.duration > 61) { alert('Video 1 deqiqeden uzun ola bilmez.'); input.value = ''; return; }
const reader = new FileReader();
reader.onload = async function() {
const token = localStorage.getItem('authToken');
try {
const res = await fetch('/api/shorts/upload', {
method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
body: JSON.stringify({ video_data: reader.result, caption: '' })
});
if (res.ok) {
input.value = '';
location.reload();
} else {
alert('Yuklenmedi, yeniden cehd edin.');
}
} catch (e) { alert('Yuklenmedi: ' + e.message); }
};
reader.readAsDataURL(file);
};
videoEl.src = URL.createObjectURL(file);
}
`;
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
