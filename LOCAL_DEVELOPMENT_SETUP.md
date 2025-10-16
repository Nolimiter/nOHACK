# Локальний запуск nOHACK - Покрокова інструкція

## 📋 TODO List для локального запуску:

- [x] Створено .env файл для backend
- [ ] Встановлено залежності backend (`npm install`)
- [ ] Запущено PostgreSQL локально
- [ ] Запущено Redis локально
- [ ] Виконано Prisma міграції
- [ ] Запущено backend dev server
- [ ] Встановлено залежності frontend
- [ ] Запущено frontend dev server

---

## Крок 1: Встановлення залежностей

### Backend
```bash
cd backend
npm install
```
✅ Вже виконується в фоні!

### Frontend
```bash
cd nOHACK/frontend
# АБО
cd frontend

npm install
```

---

## Крок 2: Налаштування баз даних

### Варіант A: Використання Docker (Рекомендовано)

**Переваги:** Швидко, не потрібно встановлювати PostgreSQL і Redis окремо

#### 1. Встановіть Docker Desktop
- Windows: https://www.docker.com/products/docker-desktop/
- Запустіть Docker Desktop після встановлення

#### 2. Створіть `docker-compose.yml` у корені проєкту:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: nohack_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: nohack_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: nohack_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### 3. Запустіть Docker контейнери:

```bash
docker-compose up -d
```

Перевірте, що контейнери запущені:
```bash
docker ps
```

Повинні бути:
- nohack_postgres (на порту 5432)
- nohack_redis (на порту 6379)

---

### Варіант B: Встановлення PostgreSQL і Redis окремо

#### PostgreSQL

**Windows:**
1. Завантажте з https://www.postgresql.org/download/windows/
2. Встановіть з дефолтними налаштуваннями
3. Запам'ятайте пароль для користувача `postgres`
4. Створіть базу даних:
   ```bash
   # Відкрийте psql
   psql -U postgres

   # Створіть базу
   CREATE DATABASE nohack_db;
   ```

#### Redis

**Windows:**
1. Завантажте з https://github.com/microsoftarchive/redis/releases
2. Або використайте WSL:
   ```bash
   wsl --install
   # Після перезавантаження:
   wsl
   sudo apt update
   sudo apt install redis-server
   redis-server
   ```

---

## Крок 3: Налаштування .env файлів

### Backend (.env)
Вже створено! Перевірте `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nohack_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-here-make-sure-its-at-least-32-characters-long"
BCRYPT_ROUNDS=12
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

**Якщо ви змінили пароль PostgreSQL**, оновіть `DATABASE_URL`:
```
postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/nohack_db
```

### Frontend (.env.local)
Вже створено! Перевірте `nOHACK/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Крок 4: Виконання міграцій Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

Це створить таблиці в базі даних PostgreSQL.

---

## Крок 5: Запуск серверів

### Термінал 1: Backend

```bash
cd backend
npm run dev
```

**Очікується:**
```
✓ HackEX server is running on port 4000
✓ Backend URL: http://localhost:4000
✓ WebSocket URL: ws://localhost:4000
✓ Redis connected successfully
```

**Якщо помилка:**
- `Redis connection failed` → перевірте, що Redis запущений (docker ps або redis-cli ping)
- `Database connection failed` → перевірте PostgreSQL і DATABASE_URL

### Термінал 2: Frontend

```bash
cd nOHACK/frontend
# АБО
cd frontend

npm run dev
```

**Очікується:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully in XXX ms
```

---

## Крок 6: Відкрийте браузер

1. Відкрийте http://localhost:3000
2. Спробуйте зареєструватися
3. Перевірте, що немає CORS помилок у DevTools (F12)

---

## 🔍 Troubleshooting

### Проблема: "Module not found" при запуску backend

**Рішення:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Проблема: "Port 4000 already in use"

**Рішення:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID [PID_NUMBER] /F

# Або змініть PORT в .env
PORT=4001
```

### Проблема: "Connection refused" до PostgreSQL

**Перевірте:**
```bash
# Якщо Docker:
docker ps | grep postgres

# Якщо локальний:
psql -U postgres -h localhost
```

### Проблема: "Connection refused" до Redis

**Перевірте:**
```bash
# Якщо Docker:
docker ps | grep redis

# Якщо локальний:
redis-cli ping
# Має повернути: PONG
```

### Проблема: Prisma міграції не працюють

**Рішення:**
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

## 📋 Швидкий Checklist

Перед запуском переконайтеся:

- [ ] Docker Desktop запущений (якщо використовуєте Docker)
- [ ] `docker-compose up -d` виконано (якщо Docker)
- [ ] PostgreSQL працює на порту 5432
- [ ] Redis працює на порту 6379
- [ ] `backend/.env` існує з правильними значеннями
- [ ] `nOHACK/frontend/.env.local` існує
- [ ] `backend/node_modules` існує
- [ ] `nOHACK/frontend/node_modules` існує
- [ ] Prisma міграції виконані (`npx prisma migrate dev`)
- [ ] Backend запущений без помилок
- [ ] Frontend запущений без помилок
- [ ] http://localhost:3000 відкривається в браузері

---

## 🚀 Швидкий запуск (якщо все встановлено)

### Використання Docker:

```bash
# Термінал 1: Запустити бази даних
docker-compose up -d

# Термінал 2: Backend
cd backend
npm run dev

# Термінал 3: Frontend
cd nOHACK/frontend
npm run dev
```

### Без Docker:

```bash
# Запустіть PostgreSQL і Redis вручну

# Термінал 1: Backend
cd backend
npm run dev

# Термінал 2: Frontend
cd nOHACK/frontend
npm run dev
```

---

## 📚 Корисні команди

```bash
# Перевірити статус Docker контейнерів
docker ps

# Зупинити Docker контейнери
docker-compose down

# Подивитися логи Docker
docker-compose logs -f

# Перезапустити один контейнер
docker restart nohack_postgres
docker restart nohack_redis

# Видалити всі дані (обережно!)
docker-compose down -v

# Перевірити Prisma схему
cd backend
npx prisma validate

# Переглянути базу даних через Prisma Studio
cd backend
npx prisma studio
```

---

**Успіхів з розробкою!** 🎉

Якщо виникнуть проблеми, перевірте логи в терміналах backend і frontend.
