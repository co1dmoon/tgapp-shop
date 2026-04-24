#!/bin/bash

set -e

echo "🚀 Деплой TG App Shop в продакшен"
echo "=================================="

command -v docker >/dev/null 2>&1 || { echo "❌ Docker не установлен. Установите Docker и повторите попытку." >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "❌ Docker Compose не установлен или не поддерживается. Установите Docker Compose v2+ и повторите попытку." >&2; exit 1; }

if [ ! -f ".env.production" ]; then
    echo "❌ Файл .env.production не найден"
    echo "📝 Создайте файл на основе .env.production.example и заполните переменные"
    exit 1
fi

set -a
source .env.production
set +a

echo "📋 Проверка конфигурации..."

required_vars=("BOT_TOKEN" "SERVER_DOMAIN" "ADMIN_IDS" "POSTGRES_PASSWORD" "VK_S3_ACCESS_KEY_ID" "VK_S3_SECRET_ACCESS_KEY" "VK_S3_BUCKET_NAME")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Переменная $var не установлена в .env.production"
        exit 1
    fi
done

if ! echo "${SERVER_DOMAIN}" | grep -qE '^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$'; then
    echo "⚠️  SERVER_DOMAIN похож не на FQDN (нужен домен для Let's Encrypt в Caddy), а на IP или пусто."
    echo "    Пример: bzonetgstore.ru"
fi

echo "✅ Обязательные переменные заданы (HTTPS: Caddy + Let's Encrypt)"

mkdir -p ./caddy

echo "🔍 Проверка запущенных контейнеров..."
if docker compose -f docker-compose.prod.yml ps --services --filter "status=running" | grep -q .; then
    echo "🔄 Обнаружены запущенные контейнеры, останавливаем..."
    docker compose -f docker-compose.prod.yml down
fi

if docker volume ls | grep -q "tgapp-shop_postgres_data"; then
    echo "💾 Резервная копия базы данных..."
    mkdir -p ./backup
    backup_name="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker run --rm \
        -v tgapp-shop_postgres_data:/var/lib/postgresql/data \
        -v "$(pwd)":/backup \
        postgres:15-alpine \
        pg_dump -h localhost -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" > "./backup/${backup_name}" || echo "⚠️ Не удалось создать резервную копию"
fi

echo "🔨 Сборка Docker образов..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Запуск сервисов..."
docker compose -f docker-compose.prod.yml up -d

echo "🔍 Проверка статуса сервисов..."
docker compose -f docker-compose.prod.yml ps

echo "🔧 Проверка работоспособности..."
app_health_ok=0
for i in $(seq 1 18); do
    if docker compose -f docker-compose.prod.yml exec -T app node -e "require('http').get('http://127.0.0.1:3001/api/health',(r)=>{r.resume();process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))" 2>/dev/null; then
        app_health_ok=1
        break
    fi
    sleep 5
done
if [ "$app_health_ok" -eq 1 ]; then
    echo "✅ Приложение отвечает внутри сети Docker"
else
    echo "⚠️ Приложение не ответило на /api/health за ~90 с, смотрите: docker compose -f docker-compose.prod.yml logs --tail=80 app"
fi

if curl -fsS --max-time 45 "https://${SERVER_DOMAIN}/health" >/dev/null 2>&1; then
    echo "✅ Публичный HTTPS /health (Let's Encrypt)"
else
    echo "⚠️ Снаружи HTTPS пока не проверился (DNS, файрвол или выпуск сертификата). Логи: docker compose -f docker-compose.prod.yml logs -f caddy"
fi

echo ""
echo "🎉 Деплой завершен!"
echo "==================="
echo ""
echo "📊 Сервисы:"
echo "  🌐 https://${SERVER_DOMAIN}"
echo "  🤖 WEBAPP_URL в приложении: https://${SERVER_DOMAIN}"
echo ""
echo "📋 Команды:"
echo "  📊 Статус:     docker compose -f docker-compose.prod.yml ps"
echo "  📜 Логи app:   docker compose -f docker-compose.prod.yml logs -f app"
echo "  📜 Логи Caddy: docker compose -f docker-compose.prod.yml logs -f caddy"
echo "  🛑 Стоп:       docker compose -f docker-compose.prod.yml down"
echo "  🗄️ Бэкап БД:   ./scripts/backup-db.sh"
echo ""
echo "🔗 BotFather: Menu Button и при необходимости Domain → https://${SERVER_DOMAIN}"
