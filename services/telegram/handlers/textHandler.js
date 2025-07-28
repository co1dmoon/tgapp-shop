const { getState, clearState } = require('../core/middlewares');

// Настройка обработчика текстовых сообщений
const setupTextHandler = (bot, webAppUrl) => {
  // Основной обработчик текстовых сообщений
  bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const state = getState(userId);
    const text = ctx.message.text.trim();

    // Выход, если нет активного состояния для пользователя
    if (!state) {
      return; // Игнорируем обычный текст без состояния
    }

    // Импортируем обработчики FSM
    const { handleCategoryFSM } = require('../modules/categories/categoryFSM');
    const { handleProductFSM } = require('../modules/products/productFSM');
    const { handleProductSearch } = require('../modules/products/productSearch');

    try {
      // Обработка поиска товаров
      if (state.startsWith('search_in_category_')) {
        await handleProductSearch(ctx, state, text);
        return;
      }

      // Обработка FSM категорий
      if (state.includes('category')) {
        await handleCategoryFSM(ctx, userId, state, text, webAppUrl);
        return;
      }

      // Обработка FSM товаров
      if (state.includes('product') || state.startsWith('edit_') || state.startsWith('wait_product_')) {
        await handleProductFSM(ctx, userId, state, text, webAppUrl);
        return;
      }

      // Если состояние не распознано, очищаем его
      console.warn(`[FSM] Неизвестное состояние: ${state} для пользователя ${userId}`);
      clearState(userId);
      
    } catch (error) {
      console.error('[FSM] Ошибка при обработке текстового сообщения:', error);
      
      // В случае ошибки очищаем состояние и уведомляем пользователя
      clearState(userId);
      await ctx.reply('Произошла ошибка. Операция отменена.');
      
      // Возвращаемся в главное меню
      try {
        const { getMainMenuKeyboard } = require('../ui/keyboards');
        const keyboard = await getMainMenuKeyboard(userId, webAppUrl);
        await ctx.reply('Вы вернулись в главное меню:', keyboard);
      } catch (menuError) {
        console.error('Ошибка при возвращении в главное меню:', menuError);
      }
    }
  });
};

module.exports = {
  setupTextHandler,
}; 