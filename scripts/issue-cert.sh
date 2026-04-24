#!/bin/bash

echo "Сертификаты Let's Encrypt получает Caddy автоматически."
echo "В .env.production задайте SERVER_DOMAIN (A-запись на этот сервер), откройте 80/443 и выполните:"
echo "  docker compose -f docker-compose.prod.yml up -d"
echo "Логи выпуска: docker compose -f docker-compose.prod.yml logs -f caddy"
