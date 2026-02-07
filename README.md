# 💰 MyHisob AI - Aqlli Moliyaviy Yordamchi

Pulingizni nazorat qiling — hayotingizni o'zgartiring

## ✨ Xususiyatlari

### 🎯 Asosiy funksiyalar
- ✅ **Daromad boshqaruvi** - Barcha daromadlaringizni kuzatib boring
- ✅ **Xarajat nazorati** - Xarajatlarni kategoriyalar bo'yicha boshqaring
- ✅ **Qarz boshqaruvi** - Berilgan/olingan qarzlarni kuzatib boring
- ✅ **AI tahlil** - Aqlli tavsiyalar va ogohlantirish
- ✅ **Real-time statistika** - Jonli hisobotlar va grafiklar
- ✅ **PWA support** - Mobil qurilmalarda ilova sifatida ishlaydi

### 🚀 Ustunliklar
- 🎨 **Zamonaviy dizayn** - Neo-bank uslubida
- 🇺🇿 **O'zbek tiliga mos** - To'liq o'zbek tilida
- 📱 **Mobil-friendly** - Har qanday qurilmada ishlaydi
- 🔒 **Xavfsiz** - JWT autentifikatsiya
- ⚡ **Tez** - SPA texnologiyasi

## 🛠️ Texnologiyalar

**Backend:**
- Node.js + Express.js
- SQLite3 (Database)
- JWT (Autentifikatsiya)
- Bcrypt (Parol shifrlash)

**Frontend:**
- Vanilla JavaScript (SPA)
- Modern CSS3
- PWA (Progressive Web App)

## 📦 O'rnatish

### 1. Node.js o'rnating
Node.js versiya 14 yoki yuqori kerak.

**Windows:**
- https://nodejs.org saytidan yuklab oling
- Installer orqali o'rnating

**Linux/Mac:**
```bash
# Node.js mavjudligini tekshiring
node --version
npm --version
```

### 2. Loyihani ishga tushurish

```bash
# 1. Papkani oching
cd myhisob-ai

# 2. Dependencies o'rnating
npm install

# 3. Serverni ishga tushuring
npm start
```

Server http://localhost:3000 da ishga tushadi

### 3. Birinchi foydalanuvchi

Brauzerda `http://localhost:3000` ochib:
1. "Ro'yxatdan o'tish" tugmasini bosing
2. Ma'lumotlarni kiriting
3. Dasturdan foydalaning!

## 🌐 Hostingda ishga tushurish

### A. Beepworld.uz (O'zbekiston)

1. **Hostingni tanlang:**
   - https://beepworld.uz ga kiring
   - VPS yoki Shared hosting tanlang
   - Node.js support borligini tekshiring

2. **FTP orqali yuklash:**
   ```
   - FileZilla yoki boshqa FTP client ishlatib
   - Barcha fayllarni public_html yoki www papkasiga yuklang
   ```

3. **SSH orqali sozlash:**
   ```bash
   # SSH orqali serverga kiring
   ssh username@your-server-ip
   
   # Papkaga o'ting
   cd public_html/myhisob-ai
   
   # Dependencies o'rnating
   npm install --production
   
   # PM2 o'rnating (server doim ishlashi uchun)
   npm install -g pm2
   
   # Ilovani ishga tushuring
   pm2 start server.js --name myhisob-ai
   
   # Auto-start qiling
   pm2 startup
   pm2 save
   ```

4. **.env faylni tahrirlang:**
   ```bash
   nano .env
   ```
   
   Quyidagilarni o'zgartiring:
   ```
   PORT=3000
   JWT_SECRET=very-secret-random-string-123456789
   NODE_ENV=production
   ```

5. **Domain sozlash:**
   - cPanel dan "Addon Domains" ga kiring
   - Domain qo'shing (masalan: myhisob.uz)
   - Document root ni loyiha papkasiga yo'naltiring

### B. Vercel (BEPUL va TEZKOR)

1. **Vercel.com ga kiring:**
   - GitHub account bilan kiring
   - "New Project" bosing

2. **GitHub repository yarating:**
   ```bash
   # Loyihani GitHub ga yuklash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/myhisob-ai.git
   git push -u origin main
   ```

3. **Vercel da import qiling:**
   - Repository ni tanlang
   - "Deploy" bosing
   - Tayyor! 🎉

**Eslatma:** Vercel da SQLite ishlamaydi, shuning uchun PostgreSQL ishlatish kerak. Buni keyinroq qo'shish mumkin.

### C. Railway.app (ODDIY)

1. **Railway.app ga kiring:**
   - GitHub bilan kiring
   - "New Project" → "Deploy from GitHub repo"

2. **Repository tanlang va Deploy qiling**

3. **Environment Variables qo'shing:**
   ```
   JWT_SECRET=your-secret-key-here
   ```

4. **Database qo'shing:**
   - "New" → "Database" → "PostgreSQL"
   - Avtomatik ulanadi

## 📱 PWA sifatida o'rnatish

**Android/Chrome:**
1. chrome://flags ochib "Desktop PWAs" yoqing
2. Saytga kiring
3. Menu → "Add to Home screen"

**iOS/Safari:**
1. Safari da saytni oching
2. Share tugmasini bosing
3. "Add to Home Screen"

## 🔐 Xavfsizlik

**MUHIM - Production uchun:**

1. **.env faylni o'zgartiring:**
   ```
   JWT_SECRET=very-long-random-string-here-use-generator
   ```

2. **HTTPS yoqing** (SSL sertifikat)
   - Let's Encrypt bilan bepul

3. **Database backup qiling:**
   ```bash
   # Har kuni backup
   cp myhisob.db backups/myhisob-$(date +%Y%m%d).db
   ```

## 📊 Database tuzilishi

```
users          - Foydalanuvchilar
├── income     - Daromadlar
├── expenses   - Xarajatlar
└── debts      - Qarzlar
    └── debt_payments - Qarz to'lovlari
```

## 🎨 Customization

**Ranglarni o'zgartirish (styles.css):**
```css
:root {
    --primary: #6366f1;  /* Asosiy rang */
    --secondary: #8b5cf6; /* Qo'shimcha rang */
}
```

**Logo o'zgartirish (index.html):**
```html
<div class="logo-icon">💰</div>  <!-- Bu yerda emoji yoki rasm -->
```

## 🐛 Muammolarni hal qilish

**Port band bo'lsa:**
```bash
# .env faylda portni o'zgartiring
PORT=8080
```

**Database xatosi:**
```bash
# Database faylini o'chiring va qayta yarating
rm myhisob.db
npm start
```

**Dependencies xatosi:**
```bash
# node_modules ni qayta o'rnating
rm -rf node_modules
npm install
```

## 📞 Yordam

Muammolar yoki savollar bo'lsa:
- Issue yarating
- Email: support@myhisob.uz (misol)

## 📄 Litsenziya

MIT License - Bepul foydalanish mumkin

## 🚀 Keyingi qadamlar

- [ ] Telegram bot integratsiyasi
- [ ] Excel export
- [ ] Chartlar qo'shish
- [ ] Oila rejimi
- [ ] Multi-currency support

---

**Muvaffaqiyat tilaymiz! 🎉**

Made with ❤️ in Uzbekistan
