# Виправлення Frontend на Vercel - Повна інструкція

## Проблема

Ваш frontend на Vercel отримував помилки:
1. ❌ `GET /api/auth/session 404` - NextAuth намагається знайти неіснуючий API route
2. ❌ `POST http://localhost:4000/api/auth/register net::ERR_CONNECTION_REFUSED` - Frontend намагається підключитися до localhost замість Railway

## Причини

### 1. NextAuth конфлікт
- У `package.json` встановлений пакет `next-auth`, але немає конфігурації
- NextAuth автоматично намагається викликати `/api/auth/session`
- Ваш проєкт НЕ використовує NextAuth (використовується власний `AuthContext`)

### 2. Неправильна змінна середовища
- Код у `authService.ts:3` очікує `NEXT_PUBLIC_API_URL`
- Але у `.env` файлах була `NEXT_PUBLIC_BACKEND_URL`
- Без правильної змінної, код використовував fallback: `http://localhost:4000/api`

---

## ✅ Рішення

### Крок 1: Оновити змінні середовища на Vercel

1. Відкрийте [Vercel Dashboard](https://vercel.com/dashboard)
2. Виберіть ваш проєкт frontend (nohack)
3. Перейдіть до **Settings** → **Environment Variables**
4. Додайте/оновіть наступну змінну:

```
Key: NEXT_PUBLIC_API_URL
Value: https://nohack-production.up.railway.app/api
```

**ВАЖЛИВО:**
- Змініть `https://nohack-production.up.railway.app` на **ваш фактичний Railway URL**
- Перевірте URL вашого backend на Railway (Settings → Domains)
- Обов'язково додайте `/api` в кінці!

5. Виберіть **Production**, **Preview**, та **Development** для всіх середовищ
6. Натисніть **Save**

### Крок 2: Видалити NextAuth (опціонально, але рекомендовано)

Оскільки ви не використовуєте NextAuth, видаліть його, щоб уникнути помилок:

```bash
cd frontend
npm uninstall next-auth
```

Або просто залиште - це не критично, але створює непотрібні помилки в консолі.

### Крок 3: Оновити CORS на Backend

Переконайтеся, що ваш backend дозволяє запити з Vercel:

У вашому файлі `backend/src/server.ts` має бути:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

На Railway встановіть змінну:
```
FRONTEND_URL=https://nohack.vercel.app
```

(Замініть на ваш фактичний Vercel URL)

### Крок 4: Redeploy на Vercel

1. Перейдіть до **Deployments** у Vercel Dashboard
2. Натисніть на три крапки (`...`) на останньому deployment
3. Виберіть **Redeploy**
4. Переконайтеся, що обрано **Use existing Build Cache** = OFF (щоб перебудувати з новими змінними)

---

## Перевірка

Після redeploy:

1. Відкрийте DevTools (F12) на вашому сайті
2. Перейдіть на сторінку реєстрації
3. Спробуйте зареєструватися
4. У вкладці **Network** ви повинні побачити:
   ```
   POST https://nohack-production.up.railway.app/api/auth/register
   Status: 201 Created (або інший успішний статус)
   ```

5. Помилки NextAuth можуть залишатися, але вони НЕ впливають на роботу:
   ```
   GET /api/auth/session 404
   ```
   Це нормально, якщо ви не використовуєте NextAuth.

---

## Як знайти правильний Railway URL

1. Відкрийте [Railway Dashboard](https://railway.app/dashboard)
2. Виберіть ваш Backend Service
3. Перейдіть до **Settings** → **Networking**
4. Скопіюйте **Public Domain** (наприклад: `nohack-production.up.railway.app`)
5. Додайте `/api` в кінці: `https://nohack-production.up.railway.app/api`

---

## Альтернативне рішення: Використати Railway Service Variables

Якщо ви хочете, щоб Railway автоматично оновлював URL:

### На Railway (Backend):
1. Переконайтеся, що ваш сервіс має **Public Domain**
2. Створіть змінну середовища:
   ```
   RAILWAY_PUBLIC_DOMAIN=nohack-production.up.railway.app
   ```

### На Vercel (Frontend):
1. Встановіть змінну:
   ```
   NEXT_PUBLIC_API_URL=https://nohack-production.up.railway.app/api
   ```

---

## Troubleshooting

### Проблема: Все ще бачу `localhost:4000`

**Рішення:**
1. Перевірте, чи правильно встановлена змінна на Vercel (Settings → Environment Variables)
2. Redeploy з очищеним кешем (Use existing Build Cache = OFF)
3. Перевірте, що назва змінної точно `NEXT_PUBLIC_API_URL` (з префіксом `NEXT_PUBLIC_`)

### Проблема: CORS помилки

**Рішення:**
1. Перевірте `FRONTEND_URL` на Railway
2. Переконайтеся, що backend дозволяє ваш Vercel домен
3. Перевірте, що `credentials: true` встановлено в CORS конфігурації

### Проблема: Railway backend не відповідає

**Рішення:**
1. Перевірте логи на Railway (Deployments → View Logs)
2. Переконайтеся, що змінні `DATABASE_URL` і `REDIS_URL` встановлені правильно
3. Перевірте, що backend запустився успішно (лог: "HackEX server is running on port...")

---

## Короткий Checklist

- [ ] Змінна `NEXT_PUBLIC_API_URL` встановлена на Vercel
- [ ] Значення змінної: `https://YOUR-RAILWAY-URL.up.railway.app/api`
- [ ] Railway backend має правильну `FRONTEND_URL`
- [ ] Redeploy на Vercel виконано з очищеним кешем
- [ ] DevTools показує запити до Railway URL (не localhost)
- [ ] Реєстрація/логін працюють

---

## Підсумок

Ваш frontend тепер правильно налаштований для роботи з Railway backend. Головні зміни:

1. ✅ Правильна змінна середовища: `NEXT_PUBLIC_API_URL`
2. ✅ Правильний URL: `https://YOUR-RAILWAY-URL.up.railway.app/api`
3. ✅ CORS налаштований для дозволу запитів з Vercel
4. ✅ Локальні `.env` файли оновлені для розробки

Якщо виникнуть додаткові питання, перевірте логи на:
- **Vercel:** Deployments → Function Logs
- **Railway:** Deployments → View Logs
