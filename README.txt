ikiurey.com canlı otaq, gecə otağı və YouTube klip düzəlişi

Bu paket mövcud C:\bottle-server-kiraye layihəsinə əlavə olunur. Oyun qovluqları və oyun faylları paketə daxil edilmir, ona görə qorunur.

Fayllar:
- server.js — /rooms siyahısı, ayrıca /room səhifəsi, YouTube klip API-si və canlı otaq route-ları
- rooms.html — gecə otaqlarının siyahısı
- night_room.html — yuxarı overlay klip, 6×2 oyunçu düzülüşü, boş yerlərdə yalnız + ikonuna toxunaraq qoşulma, başlıqsız jetonsuz düz çat, YouTube səs düyməsi, müğənni/mahnı məlumatı və şəbəkə hədiyyə paneli
- live_v2.html — kamera, mikrofon, qonaq və PK canlı axını; otaqdan ayrıca düymə ilə açılır
- profile_v2.html — profildə GECƏ OTAQLARI düyməsi və işlək butulka şəkli
- images.jpg — TikTok düyməsinin yanındakı butulka şəkli
- share_img.png — paylaşım şəkli
- youtube-icon.png, camera-icon.png — otaq ikonları
- tiktok_gift_catalog_full.json, live-gift-effects.json, gift-prices.json — tam hədiyyə kataloqu və effekt xəritəsi
- public/live-gift-videos/ — effektli hədiyyələrin bütün MP4 faylları

Quraşdırma:
1. C:\bottle-server-kiraye qovluğunda server.js, rooms.html, night_room.html, live_v2.html və profile_v2.html fayllarının ehtiyat nüsxəsini saxlayın.
2. ZIP-dən server.js, rooms.html, night_room.html, live_v2.html və profile_v2.html fayllarını Replace edin.
3. images.jpg, share_img.png, youtube-icon.png və camera-icon.png fayllarını C:\bottle-server-kiraye qovluğuna kopyalayın.
4. tiktok_gift_catalog_full.json, live-gift-effects.json və gift-prices.json fayllarını C:\bottle-server-kiraye qovluğuna kopyalayın. ZIP-dəki public qovluğunu da C:\bottle-server-kiraye\public ilə birləşdirin; public\live-gift-videos\ içindəki bütün effekt MP4-ləri saxlayın.
5. PowerShell:
   cd C:\bottle-server-kiraye
   node --check server.js
   git add server.js rooms.html night_room.html live_v2.html profile_v2.html images.jpg share_img.png youtube-icon.png camera-icon.png tiktok_gift_catalog_full.json live-gift-effects.json gift-prices.json public/live-gift-videos
   git commit -m "Polish night room clip sync and gift effects"
   git push origin main
6. Railway deploy bitəndən sonra Ctrl+F5 edin.
7. Profil düyməsi /rooms siyahısını, otaq kartı isə ayrıca gecə dizaynını açacaq.
8. Otaq səhifəsində 12 yerə qoşul; oyunçular 6 üstə, 6 altda görünür. Öz profilindəki kiçik mikrofonla səsi bağla/aç.
9. Çat oyunçuların altında düz görünür və chat sətrində jeton sayı göstərilmir. Hədiyyənin öz MP4 animasiyasındakı TikTok səsi səslənir; əlavə "dring" səsi yoxdur. Premium nişanları qalır, amma yalnız klipi qoşan oyunçunun avatarı fırlanır.
10. YouTube-dan axtar, "Əlavə et" bas; klipin altındakı X axtarış panelini bağlayır. Klip səsini ayrıca açıb-bağlamaq və yeni qoşulanın cari saniyədən başlaması mümkündür.
11. Chat ekranın aşağı hissəsində avtomatik qalır; iPhone/Android əsas menyu sahəsi və planşet ölçüsü üçün təhlükəsiz boşluq tətbiq olunur. Hədiyyə animasiyası telefon ekranına avtomatik sığır və hədiyyələr yanlara sürüşmədən şəbəkədə aşağı açılır. Yerli PM2 istifadə edirsinizsə: pm2 restart bottle-server-kiraye
