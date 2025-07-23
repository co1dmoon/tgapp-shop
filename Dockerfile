# Dockerfile для бэкенда (Node.js + Telegram bot)
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код (исключая client/)
COPY . .
RUN rm -rf client/

# Генерируем Prisma Client
RUN npx prisma generate

# Создаем директорию для временных файлов
RUN mkdir -p photos

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["npm", "start"] 