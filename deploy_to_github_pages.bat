@echo off
echo Підготовка HackEX для розгортання на GitHub Pages...

REM Перевіряємо, чи встановлено Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Помилка: Node.js не встановлено. Будь ласка, встановіть Node.js перед продовженням.
    exit /b 1
)

REM Перевіряємо, чи встановлено npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo Помилка: npm не встановлено. Будь ласка, встановіть npm перед продовженням.
    exit /b 1
)

REM Переходимо до директорії frontend
cd nOHACK\frontend

echo Встановлення залежностей...
npm install

echo Експортуємо статичний сайт...
npm run export

echo Експорт завершено. Файли для розгортання знаходяться в директорії nOHACK\frontend\out\

echo.
echo Щоб розгорнути на GitHub Pages:
echo 1. Створіть новий репозиторій на GitHub або використовуйте існуючий
echo 2. Додайте всі файли з директорії out\ до репозиторію
echo 3. У налаштуваннях репозиторію (Settings ^> Pages) виберіть гілку для розгортання
echo.
echo Зауважте: через налаштування basePath: '/nOHACK', сайт буде доступний за адресою:
echo ваш-юзернейм.github.io/nOHACK/
echo.
echo Процес підготовки до розгортання завершено.
pause