#!/bin/bash

# Скрипт резервного копирования базы данных

set -e

echo "💾 Резервное копирование базы данных TG App Shop"
echo "================================================"

# Проверяем наличие файла переменных окружения
if [ ! -f ".env.production" ]; then
    echo "❌ Файл .env.production не найден"
    exit 1
fi

# Загружаем переменные окружения
set -a
source .env.production
set +a

# Создаем папку для бэкапов
mkdir -p ./backup

# Генерируем имя файла с timestamp
BACKUP_NAME="tgappshop_backup_$(date +%Y%m%d_%H%M%S).sql"
BACKUP_PATH="./backup/${BACKUP_NAME}"

echo "📅 Создание резервной копии: ${BACKUP_NAME}"

# Проверяем, запущен ли контейнер базы данных
if ! docker compose -f docker-compose.prod.yml ps db | grep -q "Up"; then
    echo "❌ Контейнер базы данных не запущен"
    echo "🚀 Запустите сервисы: docker compose -f docker-compose.prod.yml up -d"
    exit 1
fi

# Создаем резервную копию
echo "🔄 Создание дампа базы данных..."
docker compose -f docker-compose.prod.yml exec -T db pg_dump \
    -h localhost \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    --no-password \
    --verbose \
    --clean \
    --no-owner \
    --no-privileges > "${BACKUP_PATH}"

# Проверяем размер файла
BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)

echo "✅ Резервная копия создана успешно!"
echo "📁 Файл: ${BACKUP_PATH}"
echo "📊 Размер: ${BACKUP_SIZE}"

# Показываем содержимое папки backup
echo ""
echo "📋 Список резервных копий:"
ls -lah ./backup/

# Опционально сжимаем бэкап
read -p "🗜️  Сжать резервную копию? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Сжатие резервной копии..."
    gzip "${BACKUP_PATH}"
    COMPRESSED_SIZE=$(du -h "${BACKUP_PATH}.gz" | cut -f1)
    echo "✅ Сжатая копия: ${BACKUP_PATH}.gz (${COMPRESSED_SIZE})"
fi

# Опционально удаляем старые бэкапы
BACKUP_COUNT=$(ls -1 ./backup/tgappshop_backup_*.sql* 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 5 ]; then
    echo ""
    echo "⚠️  Найдено ${BACKUP_COUNT} резервных копий"
    read -p "🗑️  Удалить старые копии (оставить последние 5)? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Удаление старых резервных копий..."
        ls -1t ./backup/tgappshop_backup_*.sql* | tail -n +6 | xargs rm -f
        echo "✅ Старые копии удалены"
    fi
fi

echo ""
echo "💡 Полезные команды:"
echo "  📤 Восстановление из бэкапа:"
echo "     cat ${BACKUP_PATH} | docker compose -f docker-compose.prod.yml exec -T db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}"
echo ""
echo "  📥 Восстановление из сжатой копии:"
echo "     zcat ${BACKUP_PATH}.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}"
echo ""
echo "✅ Резервное копирование завершено!" 