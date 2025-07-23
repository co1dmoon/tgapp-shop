const adminController = require('../../../controllers/adminController');

// Хранилище состояний пользователей для FSM (Finite State Machine)
const userStates = {};

// Функции для управления состояниями FSM
const setState = (userId, state) => {
  userStates[userId] = state;
};

const getState = (userId) => userStates[userId] || null;

const clearState = (userId) => {
  delete userStates[userId];
};

// Middleware для проверки прав администратора
const checkAdmin = async (ctx, next) => {
  const userId = ctx.from.id.toString();
  const isUserAdmin = await adminController.isAdmin(userId);
  
  if (!isUserAdmin) {
    return ctx.reply('Доступ запрещен. У вас нет прав администратора.');
  }
  
  return next();
};

// Middleware для логирования действий админа
const logAdminAction = async (ctx, next) => {
  const userId = ctx.from.id.toString();
  const userName = ctx.from.first_name || 'Unknown';
  const action = ctx.callbackQuery?.data || ctx.message?.text || 'unknown';
  
  console.log(`[ADMIN] ${userName} (${userId}): ${action}`);
  
  return next();
};

// Middleware для обработки команды /cancel
const handleCancelCommand = (webAppUrl) => {
  return async (ctx, next) => {
    const text = ctx.message?.text?.trim();
    const userId = ctx.from.id;
    const state = getState(userId);
    
    // Обработка команды отмены
    if (text === '/cancel' && state) {
      clearState(userId);
      await ctx.reply('❌ Операция отменена.');
      
      // Возвращаемся в главное меню через небольшую задержку
      setTimeout(async () => {
        try {
          const { getMainMenuKeyboard } = require('../ui/keyboards');
          const keyboard = await getMainMenuKeyboard(userId, webAppUrl);
          await ctx.reply('Вы вернулись в главное меню:', keyboard);
        } catch (error) {
          console.error('Ошибка при возвращении в главное меню:', error);
        }
      }, 500);
      return;
    }
    
    return next();
  };
};

module.exports = {
  setState,
  getState,
  clearState,
  checkAdmin,
  logAdminAction,
  handleCancelCommand,
}; 