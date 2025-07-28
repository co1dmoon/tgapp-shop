const { checkAdmin, setState } = require('../../core/middlewares');
const categoryController = require('../../../../controllers/categoryController');
const { showCategoriesList, showCategoryDetails } = require('./categoryUtils');
const {
  getCategoryEditMessage,
  getCategoryDeleteConfirmMessage,
  getCategoryDeletedMessage,
  getInputPrompts,
} = require('../../ui/messages');
const {
  getCategoryEditKeyboard,
  getCategoryDeleteKeyboard,
  getBackToCategoriesKeyboard,
} = require('../../ui/keyboards');

// Настройка обработчиков категорий
const setupCategoryHandlers = (bot) => {
  // Управление категориями (главная страница)
  bot.action('admin_categories', checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    await showCategoriesList(ctx, true);
  });

  // Просмотр категории
  bot.action(/^view_category_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = parseInt(ctx.match[1]);
    await showCategoryDetails(ctx, categoryId);
  });

  // Редактирование категории (главное меню)
  bot.action(/^edit_category_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = parseInt(ctx.match[1]);
    
    try {
      const category = await categoryController.getCategoryById(categoryId);
      if (!category) {
        return ctx.editMessageText('Категория не найдена.');
      }
      
      const message = getCategoryEditMessage(category.name);
      const keyboard = getCategoryEditKeyboard(categoryId, category.name);
      
      await ctx.editMessageText(message, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    } catch (error) {
      console.error('Ошибка при редактировании категории:', error);
      await ctx.reply('Ошибка при редактировании категории.');
    }
  });

  // Удаление категории (подтверждение)
  bot.action(/^delete_category_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = parseInt(ctx.match[1]);
    
    try {
      const category = await categoryController.getCategoryById(categoryId);
      if (!category) {
        return ctx.editMessageText('Категория не найдена.');
      }
      
      const message = getCategoryDeleteConfirmMessage(category.name, categoryId);
      const keyboard = getCategoryDeleteKeyboard(categoryId, category.name);
      
      await ctx.editMessageText(message, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      await ctx.reply('Ошибка при удалении категории.');
    }
  });

  // Подтверждение удаления категории
  bot.action(/^confirm_delete_category_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = parseInt(ctx.match[1]);
    
    try {
      const category = await categoryController.getCategoryById(categoryId);
      if (!category) {
        return ctx.editMessageText('Категория не найдена.');
      }
      
      await categoryController.deleteCategory(categoryId);
      
      const message = getCategoryDeletedMessage(category.name, categoryId);
      const keyboard = getBackToCategoriesKeyboard();
      
      await ctx.editMessageText(message, {
        ...keyboard,
      });
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      await ctx.reply('Ошибка при удалении категории.');
    }
  });

  // Начало добавления новой категории
  bot.action('add_category', checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    setState(ctx.from.id, 'wait_category_name');
    await ctx.reply(getInputPrompts.categoryName);
  });

  // Редактирование названия категории
  bot.action(/^edit_category_name_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_category_name_${categoryId}`);
    await ctx.reply(getInputPrompts.categoryName);
  });

  // Редактирование описания категории
  bot.action(/^edit_category_desc_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_category_desc_${categoryId}`);
    await ctx.reply(getInputPrompts.categoryDescription);
  });

  // Редактирование изображения категории
  bot.action(/^edit_category_image_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_category_image_${categoryId}`);
    await ctx.reply(getInputPrompts.categoryImage);
  });
};

module.exports = {
  setupCategoryHandlers,
}; 