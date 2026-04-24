#!/bin/bash

# Самоподписанные сертификаты для ручной отладки с nginx (каталог nginx/ssl).
# Продакшен: docker-compose.prod.yml использует Caddy и Let's Encrypt, этот скрипт не нужен.

set -e

echo "🔐 Генерация самоподписанных SSL сертификатов..."

# Создаем директорию для SSL сертификатов
mkdir -p ./nginx/ssl

# Проверяем, есть ли уже сертификаты
if [ -f "./nginx/ssl/cert.pem" ] && [ -f "./nginx/ssl/key.pem" ]; then
    echo "📁 SSL сертификаты уже существуют"
    echo "🔍 Проверяем срок действия..."
    
    # Проверяем срок действия сертификата
    if openssl x509 -checkend 86400 -noout -in ./nginx/ssl/cert.pem >/dev/null 2>&1; then
        echo "✅ Сертификат действителен еще минимум 24 часа"
        read -p "Хотите сгенерировать новые сертификаты? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "🚀 Используем существующие сертификаты"
            exit 0
        fi
    else
        echo "⚠️ Сертификат истекает в течение 24 часов, генерируем новый..."
    fi
fi

# Запрашиваем данные для сертификата
echo ""
echo "📝 Введите данные для SSL сертификата:"
read -p "IP адрес или домен сервера: " SERVER_DOMAIN
read -p "Страна (RU): " COUNTRY
COUNTRY=${COUNTRY:-RU}
read -p "Область/регион (Moscow): " STATE
STATE=${STATE:-Moscow}
read -p "Город (Moscow): " CITY
CITY=${CITY:-Moscow}
read -p "Организация (TG App Shop): " ORG
ORG=${ORG:-"TG App Shop"}
read -p "Подразделение (IT): " OU
OU=${OU:-IT}

echo ""
echo "🔧 Генерируем приватный ключ..."
openssl genrsa -out ./nginx/ssl/key.pem 4096

echo "🔧 Генерируем сертификат (действителен 365 дней)..."
openssl req -new -x509 -key ./nginx/ssl/key.pem -out ./nginx/ssl/cert.pem -days 365 -subj "/C=${COUNTRY}/ST=${STATE}/L=${CITY}/O=${ORG}/OU=${OU}/CN=${SERVER_DOMAIN}"

# Устанавливаем правильные права доступа
chmod 600 ./nginx/ssl/key.pem
chmod 644 ./nginx/ssl/cert.pem

echo ""
echo "✅ SSL сертификаты успешно созданы!"
echo "📁 Расположение:"
echo "   - Сертификат: ./nginx/ssl/cert.pem"
echo "   - Приватный ключ: ./nginx/ssl/key.pem"
echo ""
echo "📋 Информация о сертификате:"
openssl x509 -in ./nginx/ssl/cert.pem -text -noout | grep -E "(Subject:|Not Before:|Not After:|Subject Alternative Name:)"

echo ""
echo "⚠️  ВАЖНО:"
echo "   - Это самоподписанный сертификат"
echo "   - Браузер будет показывать предупреждение о безопасности"
echo "   - Пользователи должны будут принять сертификат вручную"
echo "   - Для продакшена рекомендуется использовать Let's Encrypt"
echo ""
echo "🔄 Обновите переменную SERVER_DOMAIN в .env.production:"
echo "   SERVER_DOMAIN=${SERVER_DOMAIN}"
echo ""
echo "🚀 Теперь можно запускать: ./scripts/deploy.sh" 