# 🚀 nOHACK - Повний Гайд з Deployment

**Дата оновлення:** 2025-10-16
**Версія:** 2.0
**Стек:** Railway (Backend) + Vercel (Frontend) + GitHub Actions (CI/CD)

---

## 📋 Зміст

1. [Огляд Архітектури](#огляд-архітектури)
2. [Railway Backend Setup](#railway-backend-setup)
3. [Vercel Frontend Setup](#vercel-frontend-setup)
4. [GitHub Actions CI/CD](#github-actions-cicd)
5. [Змінні Середовища](#змінні-середовища)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## 🏗️ Огляд Архітектури

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   GitHub    │─────▶│ GitHub       │      │   Vercel    │
│ Repository  │      │ Actions      │─────▶│  Frontend   │
└─────────────┘      │    (CI)      │      │   Next.js   │
                     └──────────────┘      └─────────────┘
                            │                      │
                            │                      │ API Calls
                            ▼                      ▼
                     ┌──────────────┐      ┌─────────────┐
                     │   Railway    │◀─────│   CORS      │
                     │   Backend    │      │  Allowed    │
                     │  Express +   │      └─────────────┘
                     │  Socket.IO   │
                     └──────────────┘
                            │
                   ┌────────┴────────┐
                   │                 │
            ┌──────▼──────┐   ┌─────▼──────┐
            │ PostgreSQL  │   │   Redis    │
            │  Database   │   │   Cache    │
            └─────────────┘   └────────────┘
```

### Компоненти:

- **Backend (Railway):** Express.js + Socket.IO + Prisma ORM
- **Database (Railway):** PostgreSQL 15
- **Cache (Railway):** Redis 7
- **Frontend (Vercel):** Next.js 15 + React 18
- **CI/CD (GitHub Actions):** Automated testing and type checking

---

## 🚂 Railway Backend Setup

### Крок 1: Створення Проєкту на Railway

1. Зайдіть на [railway.app](https://railway.app)
2. Натисніть **New Project** → **Deploy from GitHub repo**
3. Виберіть репозиторій `nOHACK`
4. Railway автоматично створить проєкт

### Крок 2: Додавання Баз Даних

#### PostgreSQL:
1. У Railway Dashboard → натисніть **+ New**
2. Виберіть **Database** → **Add PostgreSQL**
3. Дочекайтеся ініціалізації (зелений статус ✓)

#### Redis:
1. У Railway Dashboard → натисніть **+ New**
2. Виберіть **Database** → **Add Redis**
3. Дочекайтеся ініціалізації (зелений статус ✓)

### Крок 3: Налаштування Environment Variables

Railway автоматично додасть `DATABASE_URL` та `REDIS_URL`. Додайте вручну:

```bash
# Required Variables
JWT_SECRET=<згенеруйте_32+_символів>
BCRYPT_ROUNDS=12
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Optional (Railway sets automatically)
PORT=<автоматично>
```

**Генерація JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Крок 4: Налаштування Build Configuration

Railway використовує `railway.toml` та `backend/railway.json`:

**railway.toml:**
```toml
[build]
builder = "NIXPACKS"

[deploy]
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[build.nixpacks]
buildCommand = "cd backend && npm install && npx prisma generate && npm run build"
startCommand = "cd backend && npx prisma migrate deploy && npm start"

[variables]
NODE_VERSION = "18.20.8"

[healthcheck]
path = "/health"
interval = 30
timeout = 10
retries = 3
```

### Крок 5: Deployment

1. Push код на GitHub → Railway автоматично задеплоїть
2. Перевірте логи: Railway Dashboard → Backend Service → **Logs**
3. Очікуваний вивід:
   ```
   ✓ HackEX server is running on port 4000
   ✓ Redis connected successfully
   ```

### Крок 6: Налаштування Public Domain

1. Railway Dashboard → Backend Service → **Settings** → **Networking**
2. Скопіюйте **Public Domain** (наприклад: `nohack-production.up.railway.app`)
3. Збережіть URL для налаштування Vercel

---

## ⚡ Vercel Frontend Setup

### Крок 1: Імпорт Проєкту

1. Зайдіть на [vercel.com](https://vercel.com)
2. Натисніть **Add New** → **Project**
3. Імпортуйте GitHub репозиторій `nOHACK`
4. Vercel автоматично визначить Next.js

### Крок 2: Налаштування Build Settings

**Framework Preset:** Next.js (автоматично)
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `.next`
**Install Command:** `npm install`

### Крок 3: Environment Variables

Додайте у Vercel Dashboard → Project → **Settings** → **Environment Variables**:

```bash
# Required for all environments (Production, Preview, Development)
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-URL.up.railway.app/api
```

⚠️ **ВАЖЛИВО:** Додайте `/api` в кінці Railway URL!

**Застосувати до:**
- ☑️ Production
- ☑️ Preview
- ☑️ Development

### Крок 4: Deploy

1. Натисніть **Deploy**
2. Дочекайтеся завершення build (зелена галочка ✓)
3. Скопіюйте Production URL (наприклад: `nohack.vercel.app`)

### Крок 5: Оновлення Railway FRONTEND_URL

⚠️ **КРИТИЧНО:** Після отримання Vercel URL, поверніться до Railway:

1. Railway Dashboard → Backend Service → **Variables**
2. Оновіть `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://nohack.vercel.app
   ```
3. Railway автоматично redeploy backend

### Крок 6: Vercel Configuration (vercel.json)

Проєкт містить `frontend/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "X-XSS-Protection", "value": "1; mode=block"}
      ]
    }
  ]
}
```

---

## 🔄 GitHub Actions CI/CD

### Workflow: Continuous Integration (.github/workflows/ci.yml)

Автоматично запускається при:
- Push до `main` або `develop`
- Pull Request до `main` або `develop`

#### Backend CI Job:

- ✅ PostgreSQL та Redis сервіси в контейнерах
- ✅ Prisma Client генерація
- ✅ Database міграції
- ✅ Jest тести (34 тести)
- ✅ TypeScript type checking

#### Frontend CI Job:

- ✅ ESLint перевірка коду
- ✅ TypeScript type checking
- ✅ Next.js build перевірка

### Локальне тестування перед push:

```bash
# Backend тести
cd backend
npm test                 # Run all tests
npm run test:watch       # Watch mode
npx tsc --noEmit         # Type check

# Frontend перевірки
cd frontend
npm run lint             # ESLint
npm run build            # Build check
npx tsc --noEmit         # Type check
```

---

## 🔐 Змінні Середовища

### Backend Environment Variables

| Змінна | Опис | Приклад | Де встановити |
|--------|------|---------|---------------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` | Railway (автоматично) |
| `REDIS_URL` | Redis connection | `redis://...` | Railway (автоматично) |
| `JWT_SECRET` | JWT підпис (32+ символів) | `abc123...` | Railway (вручну) |
| `BCRYPT_ROUNDS` | Bcrypt складність | `12` | Railway (вручну) |
| `FRONTEND_URL` | Frontend URL для CORS | `https://nohack.vercel.app` | Railway (вручну) |
| `NODE_ENV` | Environment | `production` | Railway (вручну) |
| `PORT` | Server port | `4000` | Railway (автоматично) |

### Frontend Environment Variables

| Змінна | Опис | Приклад | Де встановити |
|--------|------|---------|---------------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `https://...railway.app/api` | Vercel (вручну) |

---

## 🔧 Troubleshooting

### Проблема 1: CORS Error

**Симптом:** `Access-Control-Allow-Origin` error у браузері

**Рішення:**
1. Перевірте `FRONTEND_URL` на Railway:
   ```bash
   railway variables | grep FRONTEND_URL
   ```
2. Переконайтеся, що backend має оновлений CORS код (`backend/src/server.ts:34-58`)
3. Vercel preview deployments автоматично дозволені через `.vercel.app` домен

### Проблема 2: 404 Not Found на API endpoints

**Симптом:** Frontend не може зв'язатися з backend

**Рішення:**
1. Перевірте `NEXT_PUBLIC_API_URL` на Vercel:
   - ✅ Правильно: `https://nohack.up.railway.app/api`
   - ❌ Неправильно: `https://nohack.up.railway.app` (без `/api`)
2. Redeploy frontend з очищеним кешем

### Проблема 3: Database Connection Failed

**Симптом:** Backend логи показують Prisma errors

**Рішення:**
1. Перевірте статус PostgreSQL на Railway (має бути зелений ✓)
2. Запустіть міграції вручну:
   ```bash
   railway run npx prisma migrate deploy
   ```
3. Перевірте `DATABASE_URL` формат

### Проблема 4: Redis Connection Failed

**Симптом:** Backend не може підключитися до Redis

**Рішення:**
1. Перевірте статус Redis на Railway (має бути зелений ✓)
2. Restart Redis service
3. Перевірте `REDIS_URL` формат

### Проблема 5: GitHub Actions Tests Failing

**Симптом:** CI pipeline fails на тестах

**Рішення:**
1. Запустіть тести локально:
   ```bash
   cd backend && npm test
   ```
2. Переконайтеся, що всі тести проходять локально
3. Перевірте логи GitHub Actions для детальної інформації

### Проблема 6: Build Failed on Railway

**Симптом:** Railway build завершується з помилкою

**Рішення:**
1. Перевірте, що `railway.toml` існує в root
2. Перевірте, що `backend/railway.json` правильно налаштований
3. Перевірте логи build:
   ```bash
   railway logs --build
   ```

---

## 🛠️ Maintenance

### Щоденні задачі:
- ✅ Моніторинг логів Railway та Vercel
- ✅ Перевірка статусу сервісів (Railway Dashboard)

### Щотижневі задачі:
- ✅ Перевірка використання ресурсів
- ✅ Backup PostgreSQL database
- ✅ Оновлення залежностей (minor versions)

### Щомісячні задачі:
- ✅ Security audit:
  ```bash
  npm audit
  npm audit fix
  ```
- ✅ Оновлення major versions пакетів
- ✅ Ротація JWT_SECRET (опціонально)

### Backup Database (PostgreSQL):

```bash
# Via Railway CLI
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
railway run psql $DATABASE_URL < backup-20251016.sql
```

---

## 📊 Моніторинг та Логи

### Railway Logs:

```bash
# View live logs
railway logs

# View build logs
railway logs --build

# View specific service
railway logs --service backend
```

### Vercel Logs:

1. Vercel Dashboard → Project → **Logs**
2. Фільтруйте за типом: Runtime, Build, Edge

### Health Checks:

```bash
# Backend health
curl https://YOUR-RAILWAY-URL.up.railway.app/health

# Expected response:
{"status":"OK","timestamp":"2025-10-16T..."}
```

---

## 🚀 Quick Commands Reference

```bash
# ==================
# Local Development
# ==================

# Backend
cd backend
npm run dev              # Start dev server
npm test                 # Run tests
npm run build            # Build TypeScript
npx prisma migrate dev   # Create migration
npx prisma studio        # Open Prisma Studio

# Frontend
cd frontend
npm run dev              # Start dev server
npm run build            # Build production
npm run lint             # Run ESLint

# ==================
# Railway CLI
# ==================

# Login and link project
railway login
railway link

# View logs and variables
railway logs
railway variables

# Run commands in Railway environment
railway run npx prisma migrate deploy
railway run npm test

# ==================
# Git & Deployment
# ==================

# Push to deploy
git add .
git commit -m "Your message"
git push origin main     # Auto-deploy Railway + Vercel

# ==================
# Testing
# ==================

# Backend tests
cd backend && npm test

# Frontend build check
cd frontend && npm run build

# Type checking
npx tsc --noEmit
```

---

## ✅ Deployment Checklist

### Initial Setup:
- [ ] Railway проєкт створено
- [ ] PostgreSQL addon додано
- [ ] Redis addon додано
- [ ] Railway environment variables встановлені
- [ ] Vercel проєкт створено
- [ ] Vercel environment variables встановлені
- [ ] GitHub Actions workflow працює

### Before Each Deployment:
- [ ] Тести проходять локально (`npm test`)
- [ ] TypeScript компілюється без помилок (`npx tsc --noEmit`)
- [ ] Frontend build успішний (`npm run build`)
- [ ] Git commit message описовий

### After Deployment:
- [ ] Backend health check працює
- [ ] Frontend відкривається без помилок
- [ ] Реєстрація/логін працює
- [ ] WebSocket з'єднання працює
- [ ] Немає CORS помилок
- [ ] Перевірено логи Railway
- [ ] Перевірено логи Vercel

---

## 📚 Додаткові Ресурси

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **GitHub Actions:** https://docs.github.com/actions

**Детальні гайди:**
- `RAILWAY_VERCEL_DEPLOYMENT_CHECKLIST.md` - Покроковий checklist
- `BACKEND_RAILWAY_DEPLOYMENT.md` - Backend deployment деталі
- `backend/.env.example` - Приклад змінних backend
- `frontend/.env.example` - Приклад змінних frontend

---

## 🎯 Успіх!

Якщо всі кроки виконані, ваш nOHACK проєкт успішно задеплоєний!

**Важливі URLs:**
- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Backend Health: https://YOUR-RAILWAY-URL.up.railway.app/health
- Frontend: https://YOUR-APP.vercel.app
- GitHub Actions: https://github.com/YOUR-USERNAME/nOHACK/actions

---

**Останнє оновлення:** 2025-10-16
**Автор:** Claude Code
**Версія:** 2.0
