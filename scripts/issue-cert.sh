#!/bin/bash

set -e

# Выпуск сертификата Let's Encrypt с webroot и подключение его в nginx

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <domain> <email>"
  exit 1
fi

DOMAIN="$1"
EMAIL="$2"

echo "🔧 Подготовка директорий..."
mkdir -p ./nginx/ssl ./nginx/www

echo "🚀 Запуск базовых сервисов (без certbot)..."
docker compose -f docker-compose.prod.yml up -d db app nginx

echo "📜 Выпуск сертификата для ${DOMAIN}..."
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path /var/www/certbot \
  --email "${EMAIL}" --agree-tos --no-eff-email \
  -d "${DOMAIN}"

echo "🔗 Подключение сертификата в nginx..."
if [ -f "./nginx/ssl/live/${DOMAIN}/fullchain.pem" ] && [ -f "./nginx/ssl/live/${DOMAIN}/privkey.pem" ]; then
  ln -sf "$(pwd)/nginx/ssl/live/${DOMAIN}/fullchain.pem" "$(pwd)/nginx/ssl/cert.pem"
  ln -sf "$(pwd)/nginx/ssl/live/${DOMAIN}/privkey.pem"   "$(pwd)/nginx/ssl/key.pem"
else
  echo "❌ Сертификат не найден в ./nginx/ssl/live/${DOMAIN}. Проверьте логи certbot."
  exit 1
fi

echo "🔄 Перезапуск nginx..."
docker compose -f docker-compose.prod.yml restart nginx

echo "✅ Готово. Проверьте: https://${DOMAIN}/health"

