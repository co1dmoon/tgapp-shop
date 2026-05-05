const { checkAdmin } = require('../core/middlewares');
const { getAdminPanelKeyboard } = require('../ui/keyboards');
const { getAdminPanelMessage } = require('../ui/messages');

// Настройка обработчиков админской панели
const setupAdminHandlers = (bot, webAppUrl) => {
  // Функция показа админской панели
  const showAdminPanel = async (ctx) => {
    const adminPanelMessage = getAdminPanelMessage();
    const keyboard = getAdminPanelKeyboard();
    
    return ctx.reply(adminPanelMessage, {
      parse_mode: 'HTML',
      ...keyboard,
    });
  };

  // Вход в админ панель (/admin команда)
  bot.command('admin', checkAdmin, showAdminPanel);

  // Вход в админ панель (кнопка)
  bot.action('admin_panel', checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    // Удаляем предыдущее сообщение меню. Telegram запрещает ботам удалять
    // сообщения старше 48 часов, поэтому глотаем ошибку — не критично.
    try { await ctx.deleteMessage(); } catch (_) { /* старое сообщение, ничего */ }
    await showAdminPanel(ctx);
  });

  // /cancel (отмена создания товара для админов)
  bot.command('cancel', checkAdmin, async (ctx) => {
    const { getState, clearState } = require('../core/middlewares');
    const { getMainMenuKeyboard } = require('../ui/keyboards');
    const { getSuccessMessages } = require('../ui/messages');
    const { delay } = require('../core/utils');
    
    const userId = ctx.from.id;
    const state = getState(userId);
    
    if (state) {
      clearState(userId);
      await ctx.reply(getSuccessMessages.operationCancelled);
      
      // Возвращаемся в главное меню через небольшую задержку
      await delay(500);
      try {
        const keyboard = await getMainMenuKeyboard(userId, webAppUrl);
        await ctx.reply(getSuccessMessages.backToMainMenu, keyboard);
      } catch (error) {
        console.error('Ошибка при возвращении в главное меню:', error);
      }
    } else {
      await ctx.reply('Нет активного процесса для отмены.');
    }
  });

  // Обработчик для неактивных кнопок (например, индикатор страницы)
  bot.action('noop', async (ctx) => {
    await ctx.answerCbQuery();
  });
};

module.exports = {
  setupAdminHandlers,
}; 