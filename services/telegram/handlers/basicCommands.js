const adminController = require('../../../controllers/adminController');
const botUserController = require('../../../controllers/botUserController');
const {
  getMainMenuKeyboard,
  getCatalogKeyboard
} = require('../ui/keyboards');
const {
  getWelcomeMessage,
  getContactMessage,
  getCatalogMessage,
  getSuccessMessages,
} = require('../ui/messages');

// Настройка базовых команд пользователя
const setupBasicHandlers = (bot, webAppUrl) => {
  // /start
  bot.start(async (ctx) => {
    const userId = ctx.from.id.toString();
    const userName = ctx.from.first_name || 'Пользователь';

    // Регистрируем пользователя для рассылок (idempotent upsert).
    botUserController.trackUser(ctx.from).catch(() => {/* не блокируем /start ошибкой треккинга */});

    try {
      const keyboard = await getMainMenuKeyboard(userId, webAppUrl);
      const welcomeMessage = getWelcomeMessage(userName);

      return ctx.reply(welcomeMessage, keyboard);
    } catch (error) {
      console.error('Ошибка при показе главного меню:', error);

      // Fallback в случае ошибки
      const keyboard = await getMainMenuKeyboard(userId, webAppUrl);
      const welcomeMessage = getWelcomeMessage(userName);

      return ctx.reply(welcomeMessage, keyboard);
    }
  });

  // /subscribe — вернуться в рассылку, если ранее отписался
  bot.command('subscribe', async (ctx) => {
    try {
      await botUserController.setSubscription(ctx.from.id, true);
      return ctx.reply('✅ Готово, ты снова получаешь рассылки.');
    } catch (e) {
      console.error('[/subscribe] ошибка:', e);
      return ctx.reply('Что-то пошло не так. Попробуй позже.');
    }
  });

  // /unsubscribe — отписаться текстовой командой
  bot.command('unsubscribe', async (ctx) => {
    try {
      await botUserController.setSubscription(ctx.from.id, false);
      return ctx.reply('🚫 Отписан от рассылок. Чтобы вернуться — /subscribe.');
    } catch (e) {
      console.error('[/unsubscribe] ошибка:', e);
      return ctx.reply('Что-то пошло не так. Попробуй позже.');
    }
  });

  // /catalog (альтернативный способ открыть каталог)
  bot.command('catalog', async (ctx) => {
    const catalogMessage = getCatalogMessage();
    const keyboard = getCatalogKeyboard(webAppUrl);
    
    return ctx.reply(catalogMessage, keyboard);
  });

  // Обработчик кнопки 'Связаться с нами'
  bot.action('contact_us', async (ctx) => {
    await ctx.answerCbQuery();

    const keyboard = await getMainMenuKeyboard(ctx.from.id, webAppUrl);
    const contactMessage = await getContactMessage();

    return ctx.editMessageText(contactMessage, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...keyboard,
    });
  });

  // Кнопка "Назад в главное меню" (из админ панели)
  bot.action('back_to_menu', async (ctx) => {
    await ctx.answerCbQuery();
    
    const keyboard = await getMainMenuKeyboard(ctx.from.id, webAppUrl);
    
    return ctx.editMessageText('Главное меню:', keyboard);
  });

  // Инициализация администраторов при запуске
  const initializeAdmins = async () => {
    try {
      console.log('[INIT] Инициализация администраторов...');
      await adminController.initAdminsFromEnv();
      console.log('[INIT] Администраторы инициализированы.');
    } catch (error) {
      console.error('[ERROR] Ошибка при инициализации администраторов:', error);
    }
  };

  return {
    initializeAdmins,
  };
};

module.exports = {
  setupBasicHandlers,
}; 