const { clearState } = require('../../core/middlewares');
const { validateText } = require('../../core/utils');
const { LIMITS } = require('../../core/config');
const categoryController = require('../../../../controllers/categoryController');
const { showCategoriesList, showCategoryDetails } = require('./categoryUtils');
const { 
  getErrorMessages, 
  getSuccessMessages,
  getInputPrompts,
} = require('../../ui/messages');
const { delay } = require('../../core/utils');

// Обработка FSM для категорий
const handleCategoryFSM = async (ctx, userId, state, text, webAppUrl) => {
  try {
    // FSM для создания новой категории
    if (state === 'wait_category_name') {
      await handleNewCategoryName(ctx, userId, text);
      return;
    }

    // FSM для создания категории (описание)
    if (state.startsWith('wait_new_category_desc|||')) {
      await handleNewCategoryDescription(ctx, userId, state, text);
      return;
    }

    // FSM для редактирования названия категории
    if (state.startsWith('edit_category_name_')) {
      await handleEditCategoryName(ctx, userId, state, text);
      return;
    }

    // FSM для редактирования описания категории
    if (state.startsWith('edit_category_desc_')) {
      await handleEditCategoryDescription(ctx, userId, state, text);
      return;
    }

    // FSM для обработки изображений категории
    if (state.startsWith('wait_new_category_image|||') || state.startsWith('edit_category_image_')) {
      await handleCategoryImageFSM(ctx, userId, state, text);
      return;
    }

    console.warn(`[CATEGORY FSM] Неизвестное состояние: ${state}`);
    clearState(userId);
  } catch (error) {
    console.error('[CATEGORY FSM] Ошибка:', error);
    clearState(userId);
    await ctx.reply('Произошла ошибка при обработке данных категории.');
  }
};

// Обработка названия новой категории
const handleNewCategoryName = async (ctx, userId, text) => {
  const validation = validateText(text, LIMITS.CATEGORY_NAME.min, LIMITS.CATEGORY_NAME.max);
  
  if (!validation.isValid) {
    return ctx.reply(getErrorMessages.categoryNameLength);
  }

  // Переходим к следующему шагу - описание
  const { setState } = require('../../core/middlewares');
  setState(userId, `wait_new_category_desc|||${text}`);
  return ctx.reply(getInputPrompts.categoryDescription);
};

// Обработка описания новой категории
const handleNewCategoryDescription = async (ctx, userId, state, text) => {
  const name = state.replace('wait_new_category_desc|||', '');
  const description = text === '-' ? null : text;
  
  // Переходим к следующему шагу - изображение
  const { setState } = require('../../core/middlewares');
  const encodedDesc = description || '';
  setState(userId, `wait_new_category_image|||${name}|||${encodedDesc}`);
  return ctx.reply(getInputPrompts.categoryImage);
};

// Создание категории без изображения (если пользователь ввел "-")
const handleCreateCategoryWithoutImage = async (ctx, userId, name, description) => {
  try {
    const categoryData = {
      name: name.trim(),
      description: description || null,
      image: null,
    };

    const category = await categoryController.createCategory(categoryData);
    clearState(userId);
    
    await ctx.reply(getSuccessMessages.categoryCreated(name, category.id));
    
    // Показываем обновленный список категорий через небольшую задержку
    await delay(500);
    await showCategoriesList(ctx, false);
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    clearState(userId);
    
    if (error.message.includes('unique') || error.message.includes('UNIQUE')) {
      await ctx.reply('❌ Категория с таким названием уже существует. Выберите другое название.');
    } else {
      await ctx.reply('❌ Произошла ошибка при создании категории. Попробуйте позже.');
    }
    
    await showCategoriesList(ctx, false);
  }
};

// Редактирование названия существующей категории
const handleEditCategoryName = async (ctx, userId, state, text) => {
  const categoryId = parseInt(state.replace('edit_category_name_', ''));
  
  const validation = validateText(text, LIMITS.CATEGORY_NAME.min, LIMITS.CATEGORY_NAME.max);
  
  if (!validation.isValid) {
    return ctx.reply(getErrorMessages.categoryNameLength);
  }

  try {
    await categoryController.updateCategory(categoryId, { name: text.trim() });
    clearState(userId);
    
    await ctx.reply(getSuccessMessages.categoryUpdated('Название'));
    
    // Возвращаемся к просмотру категории через небольшую задержку
    await delay(500);
    await showCategoryDetails(ctx, categoryId);
  } catch (error) {
    console.error('Ошибка при обновлении названия категории:', error);
    clearState(userId);
    
    if (error.message.includes('unique') || error.message.includes('UNIQUE')) {
      await ctx.reply('❌ Категория с таким названием уже существует. Выберите другое название.');
    } else {
      await ctx.reply('❌ Ошибка при обновлении названия категории.');
    }
  }
};

// Редактирование описания существующей категории
const handleEditCategoryDescription = async (ctx, userId, state, text) => {
  const categoryId = parseInt(state.replace('edit_category_desc_', ''));
  const description = text === '-' ? null : text.trim();

  try {
    await categoryController.updateCategory(categoryId, { description });
    clearState(userId);
    
    const updateMessage = description ? 'обновлено' : 'удалено';
    await ctx.reply(`✅ Описание категории ${updateMessage}`);
    
    // Возвращаемся к просмотру категории через небольшую задержку
    await delay(500);
    await showCategoryDetails(ctx, categoryId);
  } catch (error) {
    console.error('Ошибка при обновлении описания категории:', error);
    clearState(userId);
    await ctx.reply('❌ Ошибка при обновлении описания категории.');
  }
};

// Обработка FSM для изображений категории
const handleCategoryImageFSM = async (ctx, userId, state, text) => {
  // Проверяем команду пропуска через медиа модуль
  const { handleImageSkipCommand } = require('../media/mediaHandlers');
  const wasHandled = await handleImageSkipCommand(ctx, userId, state, text);
  
  if (wasHandled) return;
  
  // Если не команда пропуска, просим отправить изображение
  return ctx.reply('❌ Пожалуйста, отправьте изображение или "-" для пропуска.\n\n💡 Для отмены введите /cancel');
};

module.exports = {
  handleCategoryFSM,
  handleCreateCategoryWithoutImage, // Экспортируем для использования в media handlers
}; 