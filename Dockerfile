# Многоэтапная сборка: Frontend + Backend
FROM node:18-alpine AS frontend-builder

# Устанавливаем рабочую директорию для фронтенда
WORKDIR /app/client

# Копируем package.json и package-lock.json фронтенда
COPY client/package*.json ./

# Устанавливаем зависимости фронтенда (включая dev для сборки)
RUN npm ci

# Копируем исходный код фронтенда
COPY client/ ./

# Прокидываем продовый API URL в сборку Vite
ENV VITE_API_URL=/api

# Собираем фронтенд (будет собран в ../public)
RUN npm run build

# Основной этап: Backend
FROM node:18-alpine AS production

# Устанавливаем необходимые системные пакеты
RUN apk add --no-cache \
    openssl \
    ca-certificates \
    && update-ca-certificates

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json бэкенда
COPY package*.json ./

# Устанавливаем зависимости бэкенда
RUN npm ci --only=production

# Копируем собранный фронтенд из предыдущего этапа
COPY --from=frontend-builder /app/public ./public

# Копируем исходный код бэкенда
COPY . .

# Копируем Prisma схему и генерируем клиент
COPY prisma ./prisma
RUN npx prisma generate

# Изменяем владельца файлов
RUN chown -R nextjs:nodejs /app

# Переключаемся на непривилегированного пользователя
USER nextjs

# Открываем порт
EXPOSE 3001

# Переменные окружения по умолчанию
ENV NODE_ENV=production
ENV PORT=3001

# Проверка здоровья
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Команда запуска
# Копируем entrypoint и делаем исполняемым
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]