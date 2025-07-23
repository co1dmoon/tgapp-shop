# 🐳 TG Shop - Docker Deployment

## 🚀 Быстрый старт

### 1. Подготовка переменных окружения

```bash
# Если у вас уже есть .env файл с настройками для разработки - используйте его
# Или создайте новый для Docker:
cp .env.docker.example .env

# Отредактируйте .env файл и установите:
nano .env
```

**Обязательные переменные для Docker:**
- `BOT_TOKEN` - токен Telegram бота
- `ADMIN_IDS` - ID администраторов  
- `POSTGRES_PASSWORD` - пароль для PostgreSQL

### 2. Запуск приложения

```bash
# Используйте готовый скрипт
./docker-start.sh

# Или вручную:
docker compose up --build -d
```

### 3. Миграции базы данных

Миграции применяются **автоматически** при запуске через специальный `db-migrate` сервис.

```bash
# Ручное применение миграций (если нужно)
docker compose exec backend npx prisma migrate deploy

# Заполнение тестовыми данными (опционально)
docker compose exec backend npm run seed
```

## 📱 Доступ к сервисам

- **Frontend**: http://localhost:3000 (React + Nginx)
- **Backend API**: http://localhost:3001 (Node.js + Bot)
- **PostgreSQL**: localhost:5432

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│  (React+Nginx)  │────│ (Node.js+Bot)   │────│   (Database)    │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ⬆
                  ┌─────────────────┐
                  │   DB-Migrate    │
                  │ (Init Service)  │
                  │ Prisma Migrate  │
                  └─────────────────┘
```

**Изменения в архитектуре:**
- **Фронтенд** теперь билдится в `client/dist` (вместо `public`)
- **Nginx** раздает статику и проксирует API к бэкенду
- **Бэкенд** больше не раздает статические файлы
- **DB-Migrate** автоматически применяет миграции при запуске
- **ngrok отключен** в Docker окружении
- **Используется `docker compose`** (новая версия CLI)

## 🔧 Управление

```bash
# Статус сервисов
docker compose ps

# Логи
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Остановка
docker compose down

# Перезапуск
docker compose restart

# Вход в контейнер
docker compose exec backend sh
```

## 🛠️ Разработка vs Docker

**Для разработки:**
```bash
# Фронтенд
cd client && npm run dev

# Бэкенд  
npm run dev
```

**Для Docker:**
```bash
./docker-start.sh
```

## ⚠️ Важные отличия

1. **Сборка фронтенда**: Теперь в `client/dist` вместо `public`
2. **API URL**: В Docker фронтенд проксирует запросы через nginx
3. **Database URL**: Использует `postgres:5432` вместо `localhost:5432`
4. **ngrok**: Отключен через `USE_NGROK=false`
5. **NODE_ENV**: Устанавливается в `production` для оптимизации

## 🔍 Отладка

**Проблема:** Контейнеры не запускаются
```bash
docker compose logs
docker compose ps
```

**Проблема:** База данных недоступна
```bash
docker compose exec postgres psql -U postgres -d tg-shop
```

**Проблема:** Миграции не применились
```bash
# Проверить логи миграций
docker compose logs db-migrate

# Применить вручную
docker compose exec backend npx prisma migrate deploy
```

**Проблема:** API недоступно с фронтенда
- Проверьте логи nginx: `docker compose logs frontend`
- Проверьте что бэкенд работает: `docker compose logs backend` 