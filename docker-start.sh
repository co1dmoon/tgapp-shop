#!/bin/bash

# Скрипт для запуска TG Shop через Docker Compose

echo "🐳 Запуск TG Shop с помощью Docker Compose..."

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    echo "📋 Скопируйте существующий .env или создайте новый с настройками для Docker."
    exit 1
fi

# Проверяем наличие обязательных переменных
if ! grep -q "BOT_TOKEN=" .env; then
    echo "❌ BOT_TOKEN не установлен в .env файле!"
    exit 1
fi

if ! grep -q "POSTGRES_PASSWORD=" .env; then
    echo "❌ POSTGRES_PASSWORD не установлена в .env файле!"
    exit 1
fi

echo "✅ Проверка .env файла пройдена"

# Останавливаем существующие контейнеры (если есть)
echo "🛑 Остановка существующих контейнеров..."
docker compose down

# Очищаем старые образы (опционально)
read -p "🧹 Очистить старые Docker образы? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Очистка старых образов..."
    docker compose down --rmi all --volumes --remove-orphans
fi

# Собираем и запускаем все сервисы
echo "🏗️ Сборка и запуск сервисов..."
docker compose up --build -d

echo "⏳ Ожидание запуска сервисов..."
sleep 15

# Проверяем статус сервисов
echo "📊 Статус сервисов:"
docker compose ps

# Ждем готовности базы данных
echo "⏳ Ожидание готовности PostgreSQL..."
timeout=60
while ! docker compose exec postgres pg_isready -U postgres -d tg-shop > /dev/null 2>&1; do
    timeout=$((timeout - 1))
    if [ $timeout -eq 0 ]; then
        echo "❌ Timeout: PostgreSQL не готова"
        exit 1
    fi
    sleep 1
done
echo "✅ PostgreSQL готова!"

# Применяем миграции базы данных
echo "📦 Применение миграций базы данных..."
docker compose exec backend npx prisma migrate deploy

# Генерируем Prisma Client (на всякий случай)
echo "🔧 Генерация Prisma Client..."
docker compose exec backend npx prisma generate

# Заполняем базу данных начальными данными (опционально)
read -p "🌱 Заполнить базу данных тестовыми данными? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Заполнение базы данных..."
    docker compose exec backend npm run seed
fi

echo ""
echo "🎉 TG Shop успешно запущен!"
echo ""
echo "📱 Сервисы доступны по адресам:"
echo "   Frontend (React + Nginx): http://localhost:3000"
echo "   Backend API:              http://localhost:3001"
echo "   PostgreSQL:               localhost:5432"
echo ""
echo "📋 Полезные команды:"
echo "   Просмотр логов:           docker compose logs -f"
echo "   Логи конкретного сервиса: docker compose logs -f [backend|frontend|postgres]"
echo "   Остановка:                docker compose down"
echo "   Перезапуск:               docker compose restart"
echo "   Вход в контейнер:         docker compose exec [service] sh"
echo ""
echo "🤖 Telegram бот должен быть активен и готов к работе!"
echo "   Проверьте логи бэкенда:   docker compose logs -f backend" 