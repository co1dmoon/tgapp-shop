const productController = require('../../../../controllers/productController');
const categoryController = require('../../../../controllers/categoryController');
const { clearState } = require('../../core/middlewares');
const { LIMITS } = require('../../core/config');
const {
  getProductSearchResultsMessage,
  getErrorMessages,
} = require('../../ui/messages');
const {
  getProductSearchResultsKeyboard,
  getBackToCategoryKeyboard,
} = require('../../ui/keyboards');

// Обработка поиска товаров в категории
const handleProductSearch = async (ctx, state, searchQuery) => {
  try {
    const categoryId = parseInt(state.replace('search_in_category_', ''));
    
    // Валидация поискового запроса
    if (searchQuery.length < 1) {
      return ctx.reply(
        '❌ Поисковый запрос не может быть пустым. Введите название товара или его ID:\n\n💡 Для отмены введите /cancel'
      );
    }
    
    if (searchQuery.length > LIMITS.SEARCH_QUERY.max) {
      return ctx.reply(
        `❌ Поисковый запрос слишком длинный (максимум ${LIMITS.SEARCH_QUERY.max} символов). Попробуйте короче:\n\n💡 Для отмены введите /cancel`
      );
    }
    
    clearState(ctx.from.id); // Сбрасываем состояние поиска
    await showSearchResults(ctx, categoryId, searchQuery);
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    clearState(ctx.from.id);
    await ctx.reply('❌ Произошла ошибка при поиске товаров.');
  }
};

// Функция поиска и отображения найденных товаров
const showSearchResults = async (ctx, categoryId, searchQuery) => {
  try {
    const allProducts = await productController.getProductsByCategory(categoryId);
    const category = await categoryController.getCategoryById(categoryId);
    
    if (!category) {
      const keyboard = getBackToCategoryKeyboard(null);
      return ctx.reply('Категория не найдена.', keyboard);
    }
    
    // Фильтруем товары по поисковому запросу (регистронезависимо)
    const foundProducts = allProducts.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const idMatch = product.id.toString().includes(searchQuery);
      const productIdMatch = product.productId.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || idMatch || productIdMatch;
    });
    
    const message = getProductSearchResultsMessage(
      category.name,
      searchQuery,
      foundProducts,
      allProducts.length
    );
    
    if (foundProducts.length === 0) {
      const keyboard = getBackToCategoryKeyboard(categoryId);
      return ctx.reply(message, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    }
    
    // Ограничиваем результаты для удобства (показываем до 8 товаров)
    const displayProducts = foundProducts.slice(0, LIMITS.SEARCH_RESULTS.max);
    const hasMoreResults = foundProducts.length > LIMITS.SEARCH_RESULTS.max;
    
    const keyboard = getProductSearchResultsKeyboard(
      displayProducts,
      categoryId,
      hasMoreResults,
      foundProducts.length - LIMITS.SEARCH_RESULTS.max
    );
    
    await ctx.reply(message, {
      parse_mode: 'HTML',
      ...keyboard,
    });
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    await ctx.reply('❌ Произошла ошибка при поиске товаров.');
  }
};

// Инициализация обработчика поиска товаров
const setupProductSearch = (bot) => {
  // Поиск товаров в категории
  bot.action(/^search_product_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = parseInt(ctx.match[1]);
    
    const { setState } = require('../../core/middlewares');
    setState(ctx.from.id, `search_in_category_${categoryId}`);
    
    await ctx.reply(
      '🔍 Введите название товара для поиска:\n\n💡 Будут найдены товары, содержащие ваш запрос в названии, ID или productId\n💡 Для отмены введите /cancel'
    );
  });
};

module.exports = {
  handleProductSearch,
  showSearchResults,
  setupProductSearch,
}; 