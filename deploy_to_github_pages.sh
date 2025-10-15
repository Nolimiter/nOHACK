#!/bin/bash

# Скрипт для підготовки та експорту HackEX додатку для розгортання на GitHub Pages

echo "Підготовка HackEX для розгортання на GitHub Pages..."

# Перевіряємо, чи встановлено Node.js
if ! command -v node &> /dev/null; then
    echo "Помилка: Node.js не встановлено. Будь ласка, встановіть Node.js перед продовженням."
    exit 1
fi

# Перевіряємо, чи встановлено npm
if ! command -v npm &> /dev/null; then
    echo "Помилка: npm не встановлено. Будь ласка, встановіть npm перед продовженням."
    exit 1
fi

# Переходимо до директорії frontend
cd nOHACK/frontend

echo "Встановлення залежностей..."
npm install

echo "Експортуємо статичний сайт..."
npm run export

echo "Експорт завершено. Файли для розгортання знаходяться в директорії nOHACK/frontend/out/"

echo "Щоб розгорнути на GitHub Pages:"
echo "1. Створіть новий репозиторій на GitHub або використовуйте існуючий"
echo "2. Додайте всі файли з директорії out/ до репозиторію"
echo "3. У налаштуваннях репозиторію (Settings > Pages) виберіть гілку для розгортання"
echo ""
echo "Зауважте: через налаштування basePath: '/nOHACK', сайт буде доступний за адресою:"
echo "ваш-юзернейм.github.io/nOHACK/"

echo ""
echo "Процес підготовки до розгортання завершено."