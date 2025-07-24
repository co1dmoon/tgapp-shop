const adminController = require('../../../controllers/adminController');
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
    const contactMessage = getContactMessage();
    
    return ctx.editMessageText(contactMessage, {
      parse_mode: 'HTML',
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