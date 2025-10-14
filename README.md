# nOHACK - Веб-браузерна гра "Хакерський симулятор"

nOHACK - це багатокористувацька веб-гра в жанрі симулятора хакера з повною архітектурою багатосторінкового застосунку (MPA). Гравці беруть на себе роль хакерів, які проводять кібератаки, захищають свої системи, розвивають інфраструктуру та змагаються за домінування в кіберпросторі.

## Особливості

- **Архітектура MPA**: Кожна функція гри має власну сторінку для кращого SEO та продуктивності
- **Система зламу**: Різні типи атак (DDoS, SQL-ін'єкції, ренсомвейр, нульові дні)
- **Система захисту**: Управління фаєрволом, IDS/IPS, система реагування на інциденти
- **Економічна система**: Ринок, валюти (BTC, REP, DMT), система аукціонів
- **Система прогресу**: Дерево навичок, технологічне дерево, досягнення
- **Многокористувацька взаємодія**: Гільдії, PvP, система бонтів, турніри
- **Соціальні функції**: Чат, друзі, система повідомлень
- **Реальний час**: Інтерактивні функції за допомогою WebSocket

## Технології

- **Frontend**: Next.js (Pages Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript, Socket.io
- **Бази даних**: PostgreSQL, Redis
- **ORM**: Prisma
- **Автентифікація**: JWT, Passport.js
- **Контейнеризація**: Docker, Docker Compose
- **Веб-сервер**: Nginx

## Структура проекту

```
nOHACK/
├── frontend/                    # Next.js фронтенд
│   ├── public/
│   ├── src/
│   │   ├── pages/              # Сторінки (MPA маршрутизація)
│   │   ├── components/         # Компоненти
│   │   ├── hooks/              # Кастомні хуки
│   │   ├── stores/             # Zustand сховища
│   │   ├── services/           # API сервіси
│   │   ├── utils/              # Утиліти
│   │   └── types/              # TypeScript типи
│   ├── package.json
│   └── next.config.js
├── backend/                    # Node.js бекенд
│   ├── src/
│   │   ├── server.ts           # Вхідна точка
│   │   ├── config/             # Конфігурації
│   │   ├── controllers/        # Контролери маршрутів
│   │   ├── routes/             # Маршрути Express
│   │   ├── services/           # Бізнес-логіка
│   │   ├── socket/             # Обробники WebSocket
│   │   ├── middleware/         # Middleware Express
│   │   ├── validators/         # Валідатори (Zod)
│   │   ├── models/             # Моделі (якщо потрібні)
│   │   ├── jobs/               # Фонові завдання (Bull)
│   │   ├── cron/               # Планування завдань
│   │   ├── utils/              # Утиліти
│   │   └── types/              # TypeScript типи
│   ├── prisma/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── shared/                     # Спільний код
├── docker/                     # Docker конфігурації
├── nginx/                      # Nginx конфігурація
├── scripts/                    # Утилітні скрипти
├── docs/                       # Документація
├── .github/
├── docker-compose.yml
├── README.md
└── package.json
```

## Встановлення та запуск

### Вимоги

- Node.js >= 18.0.0
- Docker та Docker Compose
- PostgreSQL (для локального запуску без Docker)
- Redis (для локального запуску без Docker)

### Локальний запуск

1. Клонуйте репозиторій:
```bash
git clone <repository-url>
cd nOHACK
```

2. Встановіть залежності:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

3. Створіть .env файли на основі .env.example

4. Запустіть бази даних (якщо не використовуєте Docker):
```bash
# Запустіть PostgreSQL та Redis
```

5. Запустіть міграції бази даних:
```bash
cd backend
npx prisma migrate dev
```

6. Запустіть додаток:
```bash
npm run dev
```

### Запуск через Docker

1. Створіть .env файли на основі .env.example

2. Запустіть сервіси:
```bash
docker-compose up -d
```

## Розгортання

Для розгортання виробничого середовища:

1. Оновіть конфігурації в `nginx/nginx.conf`
2. Налаштуйте SSL сертифікати
3. Встановіть виробничі змінні середовища
4. Запустіть за допомогою Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Тестування

- Для запуску юніт-тестів: `npm run test`
- Для запуску E2E тестів: `npm run test:e2e`
- Для перевірки лінтером: `npm run lint`

## Документація

- [API документація](./docs/API.md)
- [Архітектурна документація](./docs/ARCHITECTURE.md)
- [Документація з розгортання](./docs/DEPLOYMENT.md)
- [Опис ігрової механіки](./docs/GAME_MECHANICS.md)
- [Посібник з участі у розробці](./docs/CONTRIBUTING.md)

## Автори

- Команда розробників nOHACK

## Ліцензія

Цей проект ліцензується за умовами MIT License - дивіться файл [LICENSE](./LICENSE) для отримання докладнішої інформації.