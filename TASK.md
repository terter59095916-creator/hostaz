# ureyimsen.com Bottle Game - Layihe Veziyyeti

## Layihe strukturu
- Backend: server.js (Node.js, Express, WebSocket, SQLite)
- Verilenler bazasi: bottle.db (Node built-in node:sqlite)
- Esl (kohne) oyun: /game - butilochka.cdnvideo.ru\bottle\html\yandex.html + preloader.7e3c34e16b36.js (kohne muherrik, isleklidir, TOXUNULMAYIB)
- Yeni test versiyasi: /game-v2 - game_v2\yandex_v2.html + game_v2\preloader_new.js (OK.ru-nun yeni muherriki 03db6fd04b15, patch edilib)
- Deploy: git add/commit/push + railway up (Railway.app)

## Bugunku TAMAMLANMIS isler

### 1. Esl saytda (/game) - iPhone audio duzelisi TAMAM
- Problem: iOS Safari AudioContext-i avtomatik baslatmir, mahni oxumurdu
- Hell: yandex.html-e toxunma-ile-kilid-acma + AudioContext keslemeye skripti elave edildi
- Status: CANLI, ISLEYIR

### 2. /game-v2 - Yeni muherrik quruldu TAMAM
- OK.ru-nun 03db6fd04b15 muherriki preloader_okru.js-den kocurulub
- web sosial identifikator ucun fallback yaradildi
- Axtaris: /api/youtube/search unvanina yonledirildi TAMAM
- Cercriveler: social platform filtri web ucun kecirilir TAMAM
- Video keyfiyyeti: hd720-e duzeldildi
- Mahni secme pencresi: tab ikonlari gizledildi

### 3. Liqa sistemi TAMAM (qismen)
- Bug: her hediyyede "liqa basladi" bildirisi sehven gosterilirdi - duzeldildi
- Sandiqlardan diamond/gem/tomato (uydurma) hediyyeler silindi
- 5 booster (kiss_fire, refuse_slap, league_kiss2x, league_kiss_lim10, league5) FUNKSIONAL edildi
- items_use mesaji server.js-de UMUMILESDIRILDI
- session.updateItems() giriste cagirilir
- TEST ucun muveqqeti admin unvani: https://ureyimsen.com/api/temp-grant-items?userId=X&item=Y&count=Z

### 4. Hediyye movqeyi (bugunku SON is) - TEST EDILMELI
- Bug: orta (ava) kateqoriyali hediyyeler 1 noqteye dusurdu
- Sebeb: game_gift mesajinda random sahesi hec gonderilmirdi
- Duzelis: client-e random: Math.floor(Math.random() * 1000000) elave edildi
- STATUS: son deploy edildi, ISTIFADECI HELE TESDIQLEMEYIB

## ACIQ (davam eden) meseleler
- [ ] Hediyye movqeyi duzelisini test et
- [ ] refuse_slap vizual sille effekti confirmasiya edilmeyib
- [ ] league_kiss2x, league_kiss_lim10, league5 funksional test edilmeyib
- [ ] Hediyye kataloqu (gift-prices.json) - OK.ru-nun yeni hediyyeleri el ile elave olunmalidir
- [ ] Sandiq daxilindeki digar elementler (cercive/das) - tam yoxlanilmayib

## VACIB QEYDLER
- preloader_new.js-de deyisiklik edende HEMISE yandex_v2.html-deki ?v= kes-parametrini tezele
- PowerShell-de coxsetirli metn evezlemelerinde bosluq/setir-sonu uygunsuzlugu tez-tez bas verir - hell: node -e ile deqiq metni JSON formatinda cixarib, ordan kocurmek
- server.js deyisende diqqetli olun - bu, CANLI, aktiv istifadecilerin oynadigi backend-dir
- Verilenler bazasi: LOKAL ve CANLI (Railway) AYRI-AYRI fayllardir
