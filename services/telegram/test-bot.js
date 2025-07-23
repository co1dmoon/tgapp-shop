// Тестовый файл для проверки модульного телеграм бота
// Запуск: node services/telegram/test-bot.js

require('dotenv').config();
const { initBot } = require('./bot');

async function testBot() {
  try {
    console.log('🧪 [TEST] Запуск тестирования модульного телеграм бота...');
    
    // Получаем URL веб-приложения из переменных окружения
    const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:3001/catalog.html';
    
    if (!process.env.BOT_TOKEN) {
      throw new Error('BOT_TOKEN не установлен в переменных окружения');
    }
    
    console.log('🔧 [TEST] Инициализация бота...');
    const bot = await initBot(webAppUrl);
    
    console.log('✅ [TEST] Модульный телеграм бот успешно инициализирован!');
    console.log('🚀 [TEST] Бот готов к работе');
    
    // Информация о состоянии
    console.log('\n📊 [TEST] Информация о боте:');
    console.log(`🤖 Username: @${bot.botInfo.username}`);
    console.log(`🌐 WebApp URL: ${webAppUrl}`);
    console.log(`📝 S3 настроен: ${require('../s3Service').isConfigured() ? 'Да' : 'Нет'}`);
    
    console.log('\n📋 [TEST] Активные модули:');
    console.log('  ✅ Базовые команды (/start, /catalog, контакты)');
    console.log('  ✅ Админская панель (/admin, /cancel)');
    console.log('  ✅ Управление категориями (CRUD, FSM)');
    console.log('  ✅ Управление товарами (CRUD, поиск, пагинация)');
    console.log('  ✅ Обработка изображений (S3, альбомы)');
    console.log('  ✅ FSM обработка текстовых сообщений');
    
    console.log('\n🎯 [TEST] Бот готов к использованию!');
    console.log('💡 [TEST] Для остановки нажмите Ctrl+C');
    
  } catch (error) {
    console.error('❌ [TEST] Ошибка при тестировании бота:', error.message);
    console.error('📋 [TEST] Стек ошибки:', error.stack);
    process.exit(1);
  }
}

// Запуск теста
testBot().catch(console.error);

// Корректное завершение при сигналах
process.once('SIGINT', () => {
  console.log('\n🛑 [TEST] Получен сигнал SIGINT, завершение...');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('\n🛑 [TEST] Получен сигнал SIGTERM, завершение...');
  process.exit(0);
}); 