# Виправлення CORS помилки на Railway Backend

## Проблема

```
Access to XMLHttpRequest at 'https://nohack-production.up.railway.app/api/auth/register'
from origin 'https://nohack-ssx6uicgh-nolimiters-projects.vercel.app'
has been blocked by CORS policy
```

## Причина

Backend на Railway був налаштований тільки для одного `FRONTEND_URL`, але Vercel створює:
1. **Production URL:** `https://nohack.vercel.app`
2. **Preview URLs:** `https://nohack-HASH.vercel.app` (різні для кожного deployment)

## Що було виправлено

### 1. Оновлено CORS конфігурацію (backend/src/server.ts)
- ✅ Додана підтримка множинних origins
- ✅ Автоматичний дозвіл для всіх Vercel preview deployments (*.vercel.app)
- ✅ Додані правильні CORS headers

### 2. Додано завантаження dotenv (backend/src/server.ts)
- ✅ Змінні середовища тепер завантажуються на початку

---

## Інструкції для Railway

### Крок 1: Встановити змінні середовища

Перейдіть до вашого Backend Service на Railway → **Variables** і переконайтеся, що встановлені:

```bash
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway
REDIS_URL=redis://default:PASSWORD@HOST:PORT
JWT_SECRET=your-super-secret-jwt-key-here-make-sure-its-at-least-32-characters-long
BCRYPT_ROUNDS=12
FRONTEND_URL=https://nohack.vercel.app
NODE_ENV=production
```

**ВАЖЛИВО для `FRONTEND_URL`:**
- Якщо ваш production Vercel URL інший, замініть його
- Це опціонально, тому що код тепер автоматично дозволяє всі `.vercel.app` домени

### Крок 2: Deploy змін на Railway

Railway автоматично deploй'ить при push до GitHub. Виконайте локально:

```bash
cd backend
git add src/server.ts
git commit -m "Fix CORS to allow all Vercel preview deployments

- Add dotenv/config at the top of server.ts
- Update CORS to allow multiple origins
- Automatically allow all *.vercel.app domains
- Add proper CORS headers and methods"

git push origin main
```

### Крок 3: Перевірити deployment на Railway

1. Перейдіть до **Deployments** на Railway
2. Дочекайтеся завершення build (зелена галочка)
3. Натисніть **View Logs** і переконайтеся, що бачите:
   ```
   HackEX server is running on port 4000
   Redis connected successfully
   ```

### Крок 4: Перевірити роботу

Відкрийте ваш Vercel сайт і спробуйте зареєструватися. У DevTools (F12) → Network ви повинні побачити:

**Успішний запит:**
```
Request URL: https://nohack-production.up.railway.app/api/auth/register
Request Method: POST
Status Code: 201 Created
Response Headers:
  access-control-allow-origin: https://nohack-ssx6uicgh-nolimiters-projects.vercel.app
  access-control-allow-credentials: true
```

---

## Troubleshooting

### Проблема 1: Все ще бачу CORS помилку

**Перевірте:**
1. Чи Railway успішно завершив deployment?
   - Railway Dashboard → Deployments → останній має зелену галочку
2. Чи backend запустився без помилок?
   - View Logs → перевірте, чи є "HackEX server is running"
3. Чи правильний URL на frontend?
   - Має бути: `https://nohack-production.up.railway.app/api`

**Якщо не допомагає:**
```bash
# Перевірте змінні середовища на Railway
railway variables

# Перезапустіть сервіс вручну
railway up --detach
```

### Проблема 2: Backend не запускається (Missing environment variables)

**Рішення:**

На Railway Dashboard встановіть всі обов'язкові змінні:
- `DATABASE_URL` - з вашого PostgreSQL addon
- `REDIS_URL` - з вашого Redis addon
- `JWT_SECRET` - згенеруйте: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `BCRYPT_ROUNDS` - встановіть `12`

### Проблема 3: 404 Not Found на /api/auth/register

**Перевірте:**
1. Чи правильний URL на frontend? Має включати `/api`
2. Чи backend роути правильно налаштовані?
   ```bash
   # Локально перевірте:
   curl https://nohack-production.up.railway.app/health
   # Має повернути: {"status":"OK","timestamp":"..."}
   ```

3. Перевірте логи на Railway:
   ```
   Should see: POST /api/auth/register
   Not: POST /auth/register
   ```

### Проблема 4: Redis connection failed

**Рішення:**

1. Переконайтеся, що Redis addon додано до проєкту Railway
2. Перевірте формат `REDIS_URL`:
   ```
   redis://default:PASSWORD@redis.railway.internal:6379
   ```
3. Якщо використовуєте зовнішній Redis, переконайтеся, що він доступний

---

## Що робить новий CORS код

```typescript
// Дозволяє:
✅ http://localhost:3000 (локальна розробка)
✅ https://nohack.vercel.app (production)
✅ https://nohack-HASH.vercel.app (preview deployments)
✅ Будь-який домен *.vercel.app

// Блокує:
❌ https://evil-site.com
❌ Інші недозволені домени
```

## Перевірка після deployment

### 1. Health Check
```bash
curl https://nohack-production.up.railway.app/health
```
Очікується: `{"status":"OK","timestamp":"2025-..."}`

### 2. CORS Preflight
```bash
curl -X OPTIONS https://nohack-production.up.railway.app/api/auth/register \
  -H "Origin: https://nohack.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```
Очікується headers:
- `access-control-allow-origin: https://nohack.vercel.app`
- `access-control-allow-credentials: true`

### 3. Фактична реєстрація
Відкрийте https://nohack.vercel.app/auth/register і спробуйте зареєструватися

---

## Підсумок змін

| Файл | Зміни |
|------|-------|
| `backend/src/server.ts` | Додано `import 'dotenv/config'` на початок |
| `backend/src/server.ts` | Оновлено CORS для підтримки множинних origins |
| `backend/src/server.ts` | Додано автоматичний дозвіл для `*.vercel.app` |

## Наступні кроки

1. ✅ Push змін до GitHub
2. ✅ Дочекатися автоматичного deployment на Railway
3. ✅ Перевірити логи на Railway
4. ✅ Протестувати реєстрацію на Vercel
5. ✅ Перевірити CORS headers у DevTools

Якщо всі кроки виконані правильно, CORS помилка зникне і frontend зможе успішно комунікувати з backend! 🎉
