const categoryController = require('../../../../controllers/categoryController');
const { 
  getCategoriesListMessage,
  getCategoryDetailsMessage,
} = require('../../ui/messages');
const {
  getCategoryManagementKeyboard,
  getCategoryViewKeyboard,
  getBackToCategoriesKeyboard,
} = require('../../ui/keyboards');

// Функция для показа списка категорий
const showCategoriesList = async (ctx, useEdit = true) => {
  try {
    const categories = await categoryController.getAllCategories();
    const message = getCategoriesListMessage(categories);
    const keyboardRows = [];

    if (categories.length === 0) {
      // Если категорий нет, показываем только кнопку добавления
      const keyboard = getCategoryManagementKeyboard();
      
      if (useEdit && ctx.callbackQuery) {
        await ctx.editMessageText(message, {
          parse_mode: 'HTML',
          ...keyboard,
        });
      } else {
        await ctx.reply(message, {
          parse_mode: 'HTML',
          ...keyboard,
        });
      }
      return;
    }

    // Создаем кнопки для каждой категории
    categories.forEach((cat) => {
      keyboardRows.push([
        { text: `👁 Просмотреть`, callback_data: `view_category_${cat.id}` },
        { text: `✏️ Редактировать`, callback_data: `edit_category_${cat.id}` }
      ]);
    });

    // Добавляем общие кнопки
    keyboardRows.push([
      { text: '➕ Добавить категорию', callback_data: 'add_category' }
    ]);
    keyboardRows.push([
      { text: '🔙 Назад', callback_data: 'admin_panel' }
    ]);

    const options = {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboardRows },
    };

    if (useEdit && ctx.callbackQuery) {
      await ctx.editMessageText(message, options);
    } else {
      await ctx.reply(message, options);
    }
  } catch (error) {
    console.error('Ошибка при показе списка категорий:', error);
    await ctx.reply('Произошла ошибка при получении списка категорий.');
  }
};

// Функция для показа деталей категории
const showCategoryDetails = async (ctx, categoryId) => {
  try {
    const category = await categoryController.getCategoryById(categoryId);
    if (!category) {
      const keyboard = getBackToCategoriesKeyboard();
      return ctx.editMessageText('Категория не найдена.', {
        ...keyboard,
      });
    }

    const message = getCategoryDetailsMessage(category);
    const keyboard = getCategoryViewKeyboard(categoryId);

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      ...keyboard,
    });
  } catch (error) {
    console.error('Ошибка при просмотре категории:', error);
    await ctx.reply('Ошибка при просмотре категории.');
  }
};

// Функция для валидации данных категории
const validateCategoryData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Название категории должно содержать минимум 2 символа');
  }

  if (data.name && data.name.length > 50) {
    errors.push('Название категории не должно превышать 50 символов');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Функция для форматирования данных категории перед сохранением
const formatCategoryData = (rawData) => {
  const formattedData = {
    name: rawData.name?.trim(),
  };

  if (rawData.description && rawData.description !== '-') {
    formattedData.description = rawData.description.trim();
  }

  if (rawData.image && rawData.image !== '-') {
    formattedData.image = rawData.image;
  }

  return formattedData;
};

module.exports = {
  showCategoriesList,
  showCategoryDetails,
  validateCategoryData,
  formatCategoryData,
}; 