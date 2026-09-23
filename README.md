# Spin the Bottle — Öz Server + Admin Panel

Bu, sizin öz domeninizdə, öz serverinizdə işləyən, admin paneli olan
"Spin the Bottle" oyununun backend-idir.

## Nə var, nə yoxdur

✅ Var:
- Real-time otaqlar (Socket.io) — istifadəçilər qoşulur, şüşə fırlanır
- Xal (points) sistemi
- Öz coin/valyuta sisteminiz (Ciliz-dən asılı deyil)
- VIP sistemi (tarixli, avtomatik bitir)
- Admin panel (login qorumalı): istifadəçi siyahısı, xal/coin vermə, VIP vermə, ban/unban
- SQLite verilənlər bazası (quraşdırma tələb etmir, tək fayldır: `bottle.db`)

❌ Hələ yoxdur (növbəti addımlarda əlavə edəcəyik):
- Öz frontend dizaynınız (hazırda `public/game/index.html` sadə test səhifəsidir)
- Telegram WebApp autentifikasiyası (hazırda test ID-ləri ilə işləyir)
- Pul/ödəniş inteqrasiyası (coin almaq üçün real ödəniş)

## Quraşdırma (Windows/PowerShell)

### 1. Faylları kompüterinizə köçürün

Bu qovluğu (`bottle-server`) kompüterinizə köçürün, məsələn:
```
C:\bottle-server
```

### 2. Asılılıqları (dependencies) yükləyin

PowerShell açın:
```powershell
cd C:\bottle-server
npm install
```

Bu, `express`, `socket.io`, `better-sqlite3` və digər lazımi paketləri yükləyəcək (bir neçə dəqiqə çəkə bilər).

### 3. `.env` faylı yaradın

```powershell
Copy-Item .env.example .env
```

Sonra `.env` faylını açıb `JWT_SECRET` sətrini uzun, təsadüfi bir mətnlə dəyişin (bu, admin login təhlükəsizliyi üçündür).

### 4. İlk admin istifadəçinizi yaradın

```powershell
node create-admin.js admin MenimGucluParolum123
```

(İstifadəçi adını və parolu özünüzə uyğun dəyişin — bunu yadda saxlayın, admin panelinə giriş üçün lazım olacaq.)

### 5. Serveri işə salın

```powershell
npm start
```

Görəcəksiniz:
```
✅ Server işə düşdü: http://localhost:3000
   Admin panel: http://localhost:3000/admin
```

### 6. Test edin

- Brauzerdə açın: `http://localhost:3000` — test oyun səhifəsini görəcəksiniz (şüşə fırlatma test rejimi)
- Brauzerdə açın: `http://localhost:3000/admin` — admin panelə "admin" (və ya yaratdığınız istifadəçi adı) və parolla daxil olun

İki fərqli brauzer tabında `http://localhost:3000` açsanız, iki "oyunçu" kimi eyni otağa qoşulacaqsınız və bir-birinizi görəcəksiniz — bu, real-time bağlantının işlədiyini sübut edir.

## Növbəti addımlar (birlikdə edəcəyik)

1. **Real domenə çıxarmaq** — bu server statik deyil (Vercel-ə uyğun deyil, çünki WebSocket + fayl sistemi lazımdır). Buna uyğun bir server lazımdır (məsələn Railway, Render, DigitalOcean, ya da öz VPS-iniz). Bunu birlikdə seçib quracağıq.
2. **Öz oyun dizaynınızı bağlamaq** — sizin əldə etdiyiniz "spin the bottle" görsəl materialları (şəkillər, səslər) bu backend-ə qoşmaq.
3. **Telegram WebApp autentifikasiyası** — istifadəçinin əsl Telegram hesabı ilə giriş etməsini təmin etmək (təhlükəsizlik üçün vacibdir).
4. **Coin/ödəniş sistemi** — istifadəçilərin real pulla coin ala bilməsi.

Hazır olduqda, addım-addım davam edək.
