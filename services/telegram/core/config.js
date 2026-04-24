require('dotenv').config();

const BOT_TOKEN = (process.env.BOT_TOKEN || '')
  .trim()
  .replace(/\r$/, '');
if (!BOT_TOKEN) {
  console.error('❌ Ошибка: Переменная окружения BOT_TOKEN не установлена!');
  process.exit(1);
}

// Проверяем формат токена
if (!BOT_TOKEN.match(/^\d+:[A-Za-z0-9_-]+$/)) {
  console.error('❌ Ошибка: Неверный формат BOT_TOKEN! Токен должен быть в формате: 123456789:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  process.exit(1);
}

console.log(`✅ BOT_TOKEN корректный (bot ID: ${BOT_TOKEN.split(':')[0]})`);

// Настройки пагинации
const PAGINATION = {
  PRODUCTS_PER_PAGE: 5,
  MAX_SEARCH_RESULTS: 8,
};

// Лимиты для валидации
const LIMITS = {
  CATEGORY_NAME: { min: 2, max: 50 },
  PRODUCT_NAME: { min: 2, max: 100 },
  SEARCH_QUERY: { max: 50 },
  SEARCH_RESULTS: { max: 8 },
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
};

// Поддерживаемые типы изображений
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'image/webp', 
  'image/gif'
];

// Контактная информация (замените на актуальные данные)
const CONTACT_INFO = {
  phone: ' +7(968)700-94-84',
  email: 'manager@b-zone.store',
  telegram: '@BZoneStoreBot',
  website: 'https://b-zone.store/'
};

module.exports = {
  BOT_TOKEN,
  PAGINATION,
  LIMITS,
  SUPPORTED_IMAGE_TYPES,
  CONTACT_INFO,
}; 