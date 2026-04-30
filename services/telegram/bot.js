const { initBot } = require('./core/bot');
const { setupBasicHandlers } = require('./handlers/basicCommands');
const { setupAdminHandlers } = require('./handlers/adminPanel');
const { setupTextHandler } = require('./handlers/textHandler');
const { setupCategoryHandlers } = require('./modules/categories/categoryHandlers');
const { setupProductHandlers } = require('./modules/products/productHandlers');
const { setupMediaHandlers } = require('./modules/media/mediaHandlers');
const { setupSettingsHandlers } = require('./modules/settings/settingsHandlers');
const { setupMailingHandlers } = require('./modules/mailing/mailingHandlers');
const { setupAdminsHandlers } = require('./modules/admins/adminsHandlers');

// Главная функция инициализации телеграм бота
const initTelegramBot = async (webAppUrl) => {
  try {
    console.log('[INIT] Запуск инициализации модульного Telegram бота...');
    
    // Инициализируем базовый бот
    const bot = await initBot(webAppUrl);
    
    // Подключаем все обработчики
    console.log('[SETUP] Подключение обработчиков...');
    
    // Базовые команды пользователя (должны быть первыми)
    const { initializeAdmins } = setupBasicHandlers(bot, webAppUrl);
    console.log('[SETUP] ✅ Базовые команды подключены');
    
    // Инициализируем администраторов
    await initializeAdmins();
    
    // Админская панель
    setupAdminHandlers(bot, webAppUrl);
    console.log('[SETUP] ✅ Админская панель подключена');
    
    // Обработчики категорий
    setupCategoryHandlers(bot);
    console.log('[SETUP] ✅ Управление категориями подключено');
    
    // Обработчики товаров
    setupProductHandlers(bot);
    console.log('[SETUP] ✅ Управление товарами подключено');
    
    // Обработчики медиа
    setupMediaHandlers(bot);
    console.log('[SETUP] ✅ Медиа обработчики подключены');

    // Обработчики настроек сайта
    setupSettingsHandlers(bot);
    console.log('[SETUP] ✅ Настройки сайта подключены');

    // Обработчики рассылки
    setupMailingHandlers(bot);
    console.log('[SETUP] ✅ Рассылка подключена');

    // Обработчики управления админами
    setupAdminsHandlers(bot);
    console.log('[SETUP] ✅ Управление админами подключено');
    
    // Обработчик текстовых сообщений (должен быть последним)
    setupTextHandler(bot, webAppUrl);
    console.log('[SETUP] ✅ Обработчик текстовых сообщений подключен');
    
    // Запуск бота после подключения всех обработчиков
    console.log('[LAUNCH] Запуск Telegram бота...');
    console.log('[LAUNCH] Проверка токена и подключение к Telegram API...');
    
    // Тестируем подключение к Telegram API
    console.log('[LAUNCH] Тестирование подключения к Telegram API...');
    try {
      const me = await bot.telegram.getMe();
      console.log(`[LAUNCH] ✅ Успешное подключение к API. Бот: @${me.username} (${me.first_name})`);
    } catch (error) {
      console.error('[LAUNCH] ❌ Ошибка подключения к Telegram API:', error.message);
      throw new Error(`Не удается подключиться к Telegram API: ${error.message}`);
    }
    
    // Запускаем бота без ожидания Promise (так как он может не резолвиться)
    bot.launch({
      dropPendingUpdates: true, // Игнорируем старые сообщения при перезапуске
    }).catch(error => {
      console.error('[LAUNCH] ❌ Критическая ошибка при запуске бота:', error);
      process.exit(1);
    });
    
    // Даем небольшую паузу для инициализации
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[LAUNCH] ✅ Бот запущен и готов к работе!');

    // Глобальная chat menu button — иконка слева от поля ввода теперь сразу
    // открывает каталог как Web App. Установка дефолтная (без chatId — для
    // всех пользователей и групп, где бот добавлен).
    try {
      await bot.telegram.setChatMenuButton({
        menuButton: {
          type: 'web_app',
          text: 'Каталог',
          web_app: { url: webAppUrl },
        },
      });
      console.log('[LAUNCH] ✅ Chat menu button установлен на каталог');
    } catch (e) {
      console.warn('[LAUNCH] ⚠ Не удалось установить chat menu button:', e?.message || e);
    }
    
    console.log('[INIT] ✅ Модульный Telegram бот успешно запущен!');
    console.log(`[INIT] Бот @${bot.botInfo.username} активен и готов к работе`);
    console.log('[INFO] Активные модули:');
    console.log('  - Базовые команды (/start, /catalog, контакты)');
    console.log('  - Админская панель (/admin)');
    console.log('  - Управление категориями (создание, редактирование, удаление)');
    console.log('  - Управление товарами (CRUD, поиск, пагинация)');
    console.log('  - Обработка изображений (категории, товары, S3)');
    console.log('  - FSM обработка текстовых сообщений');

    // Корректное завершение работы
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
    
    return bot;
  } catch (error) {
    console.error('[CRITICAL] Ошибка при инициализации модульного бота:', error);
    throw error;
  }
};

module.exports = {
  initBot: initTelegramBot, // Экспортируем как initBot для совместимости с существующим кодом
}; 