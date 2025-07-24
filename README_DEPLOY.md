# 🚀 Развертывание TG App Shop в продакшене

Полная инструкция по развертыванию Telegram бота с веб-приложением на виртуальном сервере с использованием Docker и HTTPS.

## 📋 Требования

### Системные требования
- **Операционная система**: Ubuntu 20.04 LTS или новее / CentOS 8 или новее
- **RAM**: минимум 2GB, рекомендуется 4GB
- **Диск**: минимум 10GB свободного места
- **CPU**: 2 ядра (рекомендуется)

### Установленное ПО
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Curl
- OpenSSL

## 🛠️ Подготовка сервера

### 1. Обновление системы
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. Установка Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Перелогиньтесь для применения изменений
newgrp docker
```

### 3. Установка Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Клонирование проекта
```bash
git clone <your-repository-url> tgapp-shop
cd tgapp-shop
```

## ⚙️ Настройка

### 1. Настройка переменных окружения

Скопируйте шаблон и заполните переменные:
```bash
cp .env.production .env.production.local
nano .env.production.local
```

**Обязательные переменные для изменения:**

```env
# IP адрес вашего сервера (замените на реальный)
SERVER_DOMAIN=1.2.3.4

# Токен Telegram бота (получить у @BotFather)
BOT_TOKEN=123456789:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

# Telegram User ID администратора (получить у @userinfobot)
ADMIN_USER_ID=123456789

# Пароль базы данных (сгенерируйте надежный)
POSTGRES_PASSWORD=your_very_secure_password_123

# Настройки VK Cloud S3
VK_S3_ACCESS_KEY_ID=your_access_key
VK_S3_SECRET_ACCESS_KEY=your_secret_key
VK_S3_BUCKET_NAME=your_bucket_name
```

### 2. Получение Telegram Bot токена

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте токен в переменную `BOT_TOKEN`

### 3. Получение User ID администратора

1. Откройте [@userinfobot](https://t.me/userinfobot) в Telegram
2. Отправьте любое сообщение
3. Скопируйте ваш ID в переменную `ADMIN_USER_ID`

### 4. Настройка VK Cloud S3

1. Зайдите в [VK Cloud Console](https://cloud.vk.com/)
2. Создайте проект и Object Storage
3. Создайте bucket для изображений
4. Получите ключи доступа
5. Заполните переменные `VK_S3_*`

## 🚀 Развертывание

### 1. Подготовка файлов
```bash
# Делаем скрипты исполняемыми
chmod +x scripts/*.sh

# Переименовываем файл с переменными
mv .env.production.local .env.production
```

### 2. Генерация SSL сертификатов
```bash
# Для самоподписанных сертификатов (без домена)
./scripts/setup-ssl.sh
```

**Важно**: При выполнении скрипта укажите IP адрес вашего сервера в поле "IP адрес или домен сервера"

### 3. Запуск развертывания
```bash
./scripts/deploy.sh
```

Скрипт автоматически:
- ✅ Проверит все зависимости
- ✅ Соберет Docker образы
- ✅ Запустит все сервисы
- ✅ Применит миграции базы данных
- ✅ Инициализирует начальные данные

### 4. Проверка развертывания

После завершения проверьте:
```bash
# Статус сервисов
docker-compose -f docker-compose.prod.yml ps

# Логи приложения
docker-compose -f docker-compose.prod.yml logs -f app

# Проверка HTTPS
curl -k https://your-server-ip/health
```

## 🔧 Настройка Telegram бота

После успешного развертывания настройте бота:

### 1. Настройка меню
1. Откройте [@BotFather](https://t.me/BotFather)
2. Выберите `/mybots` → Ваш бот → `Bot Settings` → `Menu Button`
3. Введите URL: `https://your-server-ip`

### 2. Настройка домена (опционально)
1. В [@BotFather](https://t.me/BotFather): `Bot Settings` → `Domain`
2. Добавьте домен: `your-server-ip`

### 3. Первый запуск
1. Найдите своего бота в Telegram
2. Отправьте `/start`
3. Используйте `/admin` для входа в панель администратора

## 🛡️ Безопасность

### Firewall настройки
```bash
# Ubuntu UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Обновления безопасности
```bash
# Настройка автоматических обновлений (Ubuntu)
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Мониторинг и логи

### Просмотр логов
```bash
# Все сервисы
docker-compose -f docker-compose.prod.yml logs -f

# Только бот
docker-compose -f docker-compose.prod.yml logs -f app

# Только nginx
docker-compose -f docker-compose.prod.yml logs -f nginx

# Только база данных
docker-compose -f docker-compose.prod.yml logs -f db
```

### Мониторинг ресурсов
```bash
# Использование ресурсов контейнерами
docker stats

# Использование дискового пространства
docker system df
```

## 💾 Резервное копирование

### Создание резервной копии
```bash
./scripts/backup-db.sh
```

### Восстановление из резервной копии
```bash
# Из обычного файла
cat ./backup/backup_file.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U tgappshop -d tgappshop

# Из сжатого файла
zcat ./backup/backup_file.sql.gz | docker-compose -f docker-compose.prod.yml exec -T db psql -U tgappshop -d tgappshop
```

## 🔄 Обновление приложения

### Обновление кода
```bash
# Получение последних изменений
git pull origin main

# Перезапуск сервисов
docker-compose -f docker-compose.prod.yml down
./scripts/deploy.sh
```

### Обновление зависимостей
```bash
# Пересборка образов
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 🚨 Устранение неполадок

### Общие проблемы

**1. Ошибка "Permission denied" при запуске скриптов**
```bash
chmod +x scripts/*.sh
```

**2. Ошибка подключения к базе данных**
```bash
# Проверьте статус
docker-compose -f docker-compose.prod.yml ps db

# Перезапустите базу данных
docker-compose -f docker-compose.prod.yml restart db
```

**3. SSL сертификат не работает**
```bash
# Пересоздайте сертификаты
rm -rf nginx/ssl/
./scripts/setup-ssl.sh
docker-compose -f docker-compose.prod.yml restart nginx
```

**4. Telegram бот не отвечает**
```bash
# Проверьте логи
docker-compose -f docker-compose.prod.yml logs -f app

# Проверьте переменные
grep BOT_TOKEN .env.production
```

### Полезные команды

```bash
# Остановка всех сервисов
docker-compose -f docker-compose.prod.yml down

# Принудительная пересборка
docker-compose -f docker-compose.prod.yml build --no-cache

# Очистка неиспользуемых ресурсов
docker system prune -f

# Перезапуск конкретного сервиса
docker-compose -f docker-compose.prod.yml restart app
```

## 🌟 Дополнительные возможности

### Настройка Let's Encrypt (когда появится домен)

1. Обновите `SERVER_DOMAIN` на ваш домен
2. Раскомментируйте сервис `certbot` в `docker-compose.prod.yml`
3. Запустите получение сертификата:
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path /var/www/certbot --email your-email@domain.com --agree-tos --no-eff-email -d your-domain.com
```

### Масштабирование

Для увеличения производительности:
```bash
# Увеличьте ресурсы в docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose -f docker-compose.prod.yml logs -f`
2. Убедитесь что все переменные окружения заданы корректно
3. Проверьте статус всех сервисов: `docker-compose -f docker-compose.prod.yml ps`

---

**✅ Готово!** Ваш Telegram бот с веб-приложением работает на HTTPS и готов к использованию. 