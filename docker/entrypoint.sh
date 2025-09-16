#!/bin/sh
set -e

echo "[ENTRYPOINT] Prisma generate..."
npx prisma generate || true

# Если есть миграции — применяем их; иначе синхронизируем схему (полезно для добавления nullable-полей)
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "[ENTRYPOINT] Running prisma migrate deploy..."
  npx prisma migrate deploy
else
  echo "[ENTRYPOINT] No migrations found. Running prisma db push..."
  npx prisma db push --accept-data-loss
fi

echo "[ENTRYPOINT] Starting app..."
exec node index.js


