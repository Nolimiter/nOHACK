# Railway + Vercel Deployment - Покроковий Checklist

Цей документ містить детальний список задач для успішного deployment nOHACK на Railway (backend) та Vercel (frontend).

---

## 📋 Частина 1: Railway Backend Deployment

### Крок 1: Підготовка проєкту
- [ ] Railway акаунт створено
- [ ] GitHub repository підключено до Railway
- [ ] Проєкт створено на Railway Dashboard

### Крок 2: Додавання баз даних
- [ ] PostgreSQL addon додано до проєкту
- [ ] Redis addon додано до проєкту
- [ ] Обидві бази даних успішно запущені (зелений статус)

### Крок 3: Налаштування змінних середовища

Перейдіть до Backend Service → **Variables** і встановіть:

- [ ] `DATABASE_URL` - автоматично з'являється після додавання PostgreSQL
  ```
  Формат: postgresql://postgres:PASSWORD@HOST:PORT/railway
  Отримати: PostgreSQL Service → Variables → DATABASE_URL
  ```

- [ ] `REDIS_URL` - автоматично з'являється після додавання Redis
  ```
  Формат: redis://default:PASSWORD@HOST:PORT
  Отримати: Redis Service → Variables → REDIS_URL
  ```

- [ ] `JWT_SECRET` - згенеруйте вручну
  ```bash
  # Виконайте локально для генерації:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

  # Або використайте:
  your-super-secret-jwt-key-here-make-sure-its-at-least-32-characters-long
  ```

- [ ] `BCRYPT_ROUNDS=12`

- [ ] `FRONTEND_URL=https://nohack.vercel.app`
  ```
  Замініть на ваш фактичний Vercel production URL
  ```

- [ ] `NODE_ENV=production`

### Крок 4: Налаштування Build & Deploy

Railway Dashboard → Backend Service → **Settings**:

- [ ] **Root Directory:** `backend` (або залиште порожнім якщо використовується nixpacks)
- [ ] **Build Command:** автоматично (nixpacks визначить з package.json)
- [ ] **Start Command:** `npm start` (або автоматично)
- [ ] **Watch Paths:** `backend/**` (опціонально, для моніторингу тільки backend змін)

### Крок 5: Запуск Deployment

- [ ] Push код на GitHub → Railway автоматично почне deployment
- [ ] Дочекайтеся завершення build (зелена галочка ✓)
- [ ] Перевірте логи: **View Logs**
  ```
  Очікується побачити:
  ✓ HackEX server is running on port 4000
  ✓ Redis connected successfully
  ```

### Крок 6: Налаштування Domain

- [ ] Railway автоматично створить публічний домен
- [ ] Скопіюйте URL (Settings → Networking → Public Domain)
  ```
  Приклад: nohack-production.up.railway.app
  ```
- [ ] Збережіть URL - він знадобиться для Vercel

### Крок 7: Тестування Backend

- [ ] Health check працює:
  ```bash
  curl https://YOUR-RAILWAY-URL.up.railway.app/health
  # Очікується: {"status":"OK","timestamp":"..."}
  ```

- [ ] CORS налаштований правильно:
  ```bash
  curl -X OPTIONS https://YOUR-RAILWAY-URL.up.railway.app/api/auth/register \
    -H "Origin: https://nohack.vercel.app" \
    -H "Access-Control-Request-Method: POST" \
    -v
  # Очікується headers: access-control-allow-origin
  ```

---

## 📋 Частина 2: Vercel Frontend Deployment

### Крок 1: Підготовка проєкту
- [ ] Vercel акаунт створено
- [ ] GitHub repository підключено до Vercel
- [ ] Проєкт імпортовано на Vercel

### Крок 2: Налаштування Build Settings

Vercel Dashboard → Project Settings → **Build & Development Settings**:

- [ ] **Framework Preset:** Next.js (автоматично визначається)
- [ ] **Root Directory:** `nOHACK/frontend` або `frontend`
- [ ] **Build Command:** `npm run build` (автоматично)
- [ ] **Output Directory:** `.next` (автоматично)
- [ ] **Install Command:** `npm install` (автоматично)

### Крок 3: Налаштування змінних середовища

Vercel Dashboard → Project → **Settings** → **Environment Variables**:

- [ ] `NEXT_PUBLIC_API_URL` встановлено для всіх середовищ
  ```
  Key: NEXT_PUBLIC_API_URL
  Value: https://YOUR-RAILWAY-URL.up.railway.app/api

  ⚠️ ВАЖЛИВО: Обов'язково додайте /api в кінці!

  Застосувати до:
  ☑ Production
  ☑ Preview
  ☑ Development
  ```

### Крок 4: Deployment

- [ ] Натисніть **Deploy** або push до GitHub
- [ ] Дочекайтеся завершення build
- [ ] Перевірте URL deployment (наприклад: `nohack.vercel.app`)

### Крок 5: Оновлення FRONTEND_URL на Railway

⚠️ **ВАЖЛИВО:** Після отримання Vercel production URL, оновіть Railway:

- [ ] Повернутися до Railway Dashboard
- [ ] Backend Service → **Variables**
- [ ] Оновити `FRONTEND_URL` з фактичним Vercel URL:
  ```
  FRONTEND_URL=https://nohack.vercel.app
  ```
- [ ] Railway автоматично redeploy backend

### Крок 6: Тестування Frontend

- [ ] Відкрийте ваш Vercel URL у браузері
- [ ] Відкрийте DevTools (F12) → **Console**
- [ ] Перевірте, що немає помилок CORS або connection refused

- [ ] Спробуйте зареєструватися на `/auth/register`
- [ ] У DevTools → **Network** перевірте:
  ```
  ✓ Request URL: https://YOUR-RAILWAY-URL.up.railway.app/api/auth/register
  ✓ Status: 201 Created
  ✓ Response Headers містять: access-control-allow-origin
  ```

---

## 📋 Частина 3: Troubleshooting Checklist

### Проблема: CORS Error

- [ ] Перевірте, що backend код містить оновлену CORS конфігурацію
  ```typescript
  // backend/src/server.ts має містити:
  import 'dotenv/config'; // На самому початку

  // CORS має дозволяти *.vercel.app
  origin.includes('.vercel.app')
  ```

- [ ] Перевірте, що `FRONTEND_URL` встановлена на Railway
- [ ] Перевірте логи Railway на наявність помилок CORS
- [ ] Redeploy backend після змін CORS

### Проблема: 404 Not Found на /api/auth/register

- [ ] Перевірте `NEXT_PUBLIC_API_URL` на Vercel:
  ```
  Правильно: https://nohack-production.up.railway.app/api
  Неправильно: https://nohack-production.up.railway.app (без /api)
  ```

- [ ] Перевірте, що backend роути налаштовані:
  ```typescript
  // backend/src/server.ts
  app.use('/api/auth', authRoutes);
  ```

- [ ] Redeploy Vercel з очищеним кешем (Build Cache = OFF)

### Проблема: ERR_CONNECTION_REFUSED або localhost:4000

- [ ] `NEXT_PUBLIC_API_URL` НЕ встановлена на Vercel
- [ ] Встановіть змінну на Vercel
- [ ] Redeploy з очищеним кешем

### Проблема: Missing required environment variables

- [ ] Перевірте всі змінні на Railway:
  ```bash
  railway variables
  ```

- [ ] Переконайтеся, що встановлені:
  - DATABASE_URL
  - REDIS_URL
  - JWT_SECRET
  - BCRYPT_ROUNDS

- [ ] Redeploy backend після додавання змінних

### Проблема: Redis connection failed

- [ ] Redis addon запущений на Railway (зелений статус)
- [ ] `REDIS_URL` правильного формату:
  ```
  redis://default:PASSWORD@redis.railway.internal:6379
  ```
- [ ] Перевірте логи Redis addon
- [ ] Restart Redis addon якщо потрібно

### Проблема: Database connection failed

- [ ] PostgreSQL addon запущений на Railway (зелений статус)
- [ ] `DATABASE_URL` правильного формату:
  ```
  postgresql://postgres:PASSWORD@HOST:PORT/railway
  ```
- [ ] Запустіть міграції Prisma:
  ```bash
  railway run npx prisma migrate deploy
  ```

---

## 📋 Частина 4: Фінальна Перевірка

### Backend (Railway)
- [ ] ✓ Deployment успішний (зелена галочка)
- [ ] ✓ Логи показують "server is running"
- [ ] ✓ Health endpoint відповідає: `/health`
- [ ] ✓ PostgreSQL підключений
- [ ] ✓ Redis підключений
- [ ] ✓ CORS налаштований для Vercel

### Frontend (Vercel)
- [ ] ✓ Deployment успішний
- [ ] ✓ Сайт відкривається без помилок
- [ ] ✓ `NEXT_PUBLIC_API_URL` встановлена правильно
- [ ] ✓ Реєстрація працює
- [ ] ✓ Логін працює
- [ ] ✓ Немає CORS помилок у DevTools

### Інтеграція
- [ ] ✓ Frontend успішно комунікує з Backend
- [ ] ✓ API запити йдуть на Railway URL (не localhost)
- [ ] ✓ Автентифікація працює end-to-end
- [ ] ✓ WebSocket з'єднання працює (якщо використовується)

---

## 📋 Частина 5: Регулярне Обслуговування

### Після кожного оновлення коду:
- [ ] Push змін на GitHub
- [ ] Дочекатися автоматичного deployment на Railway та Vercel
- [ ] Перевірити логи на обох платформах
- [ ] Протестувати критичні функції

### Щотижня:
- [ ] Перевірити логи на помилки
- [ ] Перевірити використання ресурсів (Railway Dashboard)
- [ ] Backup бази даних (PostgreSQL)

### Щомісяця:
- [ ] Оновити залежності (`npm update`)
- [ ] Перевірити безпеку (`npm audit`)
- [ ] Ротація JWT_SECRET (опціонально, для production)

---

## 🎯 Швидкий Reference

### Важливі URLs:
```
Railway Dashboard: https://railway.app/dashboard
Vercel Dashboard: https://vercel.com/dashboard
Backend Health: https://YOUR-RAILWAY-URL.up.railway.app/health
Frontend: https://YOUR-VERCEL-URL.vercel.app
GitHub Repo: https://github.com/YOUR-USERNAME/nOHACK
```

### Важливі команди:
```bash
# Локальна розробка
cd backend && npm run dev
cd frontend && npm run dev

# Перевірка змінних Railway
railway variables

# Перевірка логів Railway
railway logs

# Міграції Prisma
railway run npx prisma migrate deploy

# Генерація JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Тестування API
curl https://YOUR-RAILWAY-URL.up.railway.app/health
```

---

## ✅ Успіх!

Якщо всі пункти checklist відмічені ✓, ваш додаток успішно задеплоєний і працює!

**Документація:**
- Детальні інструкції Railway: `RAILWAY_CORS_FIX.md`
- Детальні інструкції Vercel: `VERCEL_FRONTEND_FIX.md`
- Backend deployment: `BACKEND_RAILWAY_DEPLOYMENT.md`

**Підтримка:**
- Railway Support: https://railway.app/help
- Vercel Support: https://vercel.com/support
- Next.js Docs: https://nextjs.org/docs

---

**Останнє оновлення:** 2025-10-16
**Версія:** 1.0
**Автор:** Claude Code
