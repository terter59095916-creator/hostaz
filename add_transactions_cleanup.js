const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const old = "const tablesWithUserId = ['messages', 'friendships', 'follows', 'visited_rooms', 'device_bindings', 'photos', 'shorts', 'short_likes', 'short_comments', 'notifications', 'played_together', 'harem_ownership', 'profile_views', 'posts', 'post_likes', 'post_comments', 'photo_comments', 'harem_inbox'];";
const idx = c.indexOf(old);
console.log("Tapildi:", idx !== -1);
if (idx !== -1) {
  const replacement = "const tablesWithUserId = ['messages', 'friendships', 'follows', 'visited_rooms', 'device_bindings', 'photos', 'shorts', 'short_likes', 'short_comments', 'notifications', 'played_together', 'harem_ownership', 'profile_views', 'posts', 'post_likes', 'post_comments', 'photo_comments', 'harem_inbox', 'transactions'];";
  c = c.replace(old, replacement);
  fs.writeFileSync(path, c, "utf8");
  console.log("YAZILDI");
}
