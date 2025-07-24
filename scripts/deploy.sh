#!/bin/bash

# Скрипт деплоя приложения TG App Shop в продакшен
# Поддерживает как самоподписанные сертификаты, так и Let's Encrypt

set -e

echo "🚀 Деплой TG App Shop в продакшен"
echo "=================================="

# Проверяем наличие необходимых инструментов
command -v docker >/dev/null 2>&1 || { echo "❌ Docker не установлен. Установите Docker и повторите попытку." >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "❌ Docker Compose не установлен или не поддерживается. Установите Docker Compose v2+ и повторите попытку." >&2; exit 1; }

# Проверяем наличие файла переменных окружения
if [ ! -f ".env.production" ]; then
    echo "❌ Файл .env.production не найден"
    echo "📝 Создайте файл на основе .env.production и заполните переменные"
    exit 1
fi

# Загружаем переменные окружения
set -a
source .env.production
set +a

echo "📋 Проверка конфигурации..."

# Проверяем обязательные переменные
required_vars=("BOT_TOKEN" "SERVER_DOMAIN" "ADMIN_IDS" "POSTGRES_PASSWORD" "VK_S3_ACCESS_KEY_ID" "VK_S3_SECRET_ACCESS_KEY" "VK_S3_BUCKET_NAME")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Переменная $var не установлена в .env.production"
        exit 1
    fi
done

echo "✅ Все обязательные переменные установлены"

# Проверяем SSL сертификаты
echo "🔐 Проверка SSL сертификатов..."
if [ ! -f "./nginx/ssl/cert.pem" ] || [ ! -f "./nginx/ssl/key.pem" ]; then
    echo "❌ SSL сертификаты не найдены"
    echo "🔧 Запуск генерации самоподписанных сертификатов..."
    ./scripts/setup-ssl.sh
else
    echo "✅ SSL сертификаты найдены"
fi

# Создаем необходимые директории
echo "📁 Создание директорий..."
mkdir -p ./nginx/logs
mkdir -p ./nginx/www

# Проверяем, есть ли запущенные контейнеры
echo "🔍 Проверка запущенных контейнеров..."
if docker compose -f docker-compose.prod.yml ps --services --filter "status=running" | grep -q .; then
    echo "🔄 Обнаружены запущенные контейнеры, останавливаем..."
    docker compose -f docker-compose.prod.yml down
fi

# Создаем резервную копию базы данных если она существует
if docker volume ls | grep -q "tgapp-shop_postgres_data"; then
    echo "💾 Создание резервной копии базы данных..."
    backup_name="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker run --rm \
        -v tgapp-shop_postgres_data:/var/lib/postgresql/data \
        -v $(pwd):/backup \
        postgres:15-alpine \
        pg_dump -h localhost -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" > "./backup/${backup_name}" || echo "⚠️ Не удалось создать резервную копию"
fi

# Сборка и запуск
echo "🔨 Сборка Docker образов..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Запуск сервисов..."
docker compose -f docker-compose.prod.yml up -d

# Ожидание запуска базы данных
echo "⏳ Ожидание запуска базы данных..."
sleep 10

# Синхронизация схемы базы данных с Prisma
echo "🔄 Синхронизация схемы базы данных..."
docker compose -f docker-compose.prod.yml exec app npx prisma db push --accept-data-loss || echo "⚠️ Ошибка синхронизации схемы"

# Проверка статуса сервисов
echo "🔍 Проверка статуса сервисов..."
docker compose -f docker-compose.prod.yml ps

# Проверка работоспособности
echo "🔧 Проверка работоспособности..."
sleep 5

if curl -k -f "https://localhost/health" >/dev/null 2>&1; then
    echo "✅ Сервис отвечает на HTTPS"
else
    echo "⚠️ Сервис не отвечает на HTTPS, проверьте логи"
fi

# Вывод информации
echo ""
echo "🎉 Деплой завершен!"
echo "==================="
echo ""
echo "📊 Информация о сервисах:"
echo "  🌐 HTTPS URL: https://${SERVER_DOMAIN}"
echo "  🔗 HTTP URL: http://${SERVER_DOMAIN} (редирект на HTTPS)"
echo "  🤖 Telegram Bot: настроен для работы с https://${SERVER_DOMAIN}"
echo ""
echo "📋 Полезные команды:"
echo "  📊 Статус:        docker compose -f docker-compose.prod.yml ps"
echo "  📜 Логи:          docker compose -f docker-compose.prod.yml logs -f"
echo "  📜 Логи бота:     docker compose -f docker-compose.prod.yml logs -f app"
echo "  📜 Логи nginx:    docker compose -f docker-compose.prod.yml logs -f nginx"
echo "  🔄 Перезапуск:    docker compose -f docker-compose.prod.yml restart"
echo "  🛑 Остановка:     docker compose -f docker-compose.prod.yml down"
echo "  🗄️ Бэкап БД:      ./scripts/backup-db.sh"
echo "  🌱 Тест данные:   docker compose -f docker-compose.prod.yml exec app npm run seed"
echo ""
echo "⚠️  ВАЖНЫЕ ЗАМЕЧАНИЯ:"
echo "  - Используются самоподписанные SSL сертификаты"
echo "  - Браузер покажет предупреждение о безопасности"
echo "  - Для Telegram WebApp это нормально"
echo "  - Для публичного использования настройте Let's Encrypt"
echo ""
echo "🔗 Настройка Telegram бота:"
echo "  1. Откройте @BotFather в Telegram"
echo "  2. Выберите ваш бот"
echo "  3. Menu Button -> Настройте кнопку меню: https://${SERVER_DOMAIN}"
echo "  4. Domain -> Добавьте домен: ${SERVER_DOMAIN}" 