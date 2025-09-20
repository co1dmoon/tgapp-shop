const { checkAdmin, setState } = require('../../core/middlewares');
const productController = require('../../../../controllers/productController');
const categoryController = require('../../../../controllers/categoryController');
const { showProductsPage, showProductDetails } = require('./productUtils');
const { setupProductSearch } = require('./productSearch');
const {
  getProductEditMessage,
  getProductDeleteConfirmMessage,
  getProductDeletedMessage,
  getInputPrompts,
} = require('../../ui/messages');
const {
  getProductEditKeyboard,
  getProductDeleteKeyboard,
  getCategorySelectionKeyboard,
  getBackToProductsKeyboard,
} = require('../../ui/keyboards');

// Настройка обработчиков товаров
const setupProductHandlers = (bot) => {
  // Управление товарами (выбор категории)
  bot.action('admin_products', checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    await showCategorySelection(ctx);
  });

  // Просмотр товаров в категории (первая страница)
  bot.action(/^products_cat_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = parseInt(ctx.match[1]);
    await showProductsPage(ctx, categoryId, 0);
  });

  // Навигация по страницам товаров
  bot.action(/^products_page_(\d+)_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = parseInt(ctx.match[1]);
    const page = parseInt(ctx.match[2]);
    await showProductsPage(ctx, categoryId, page);
  });

  // Обработчик для неактивных кнопок (например, индикатор страницы)
  bot.action('noop', async (ctx) => {
    await ctx.answerCbQuery();
  });

  // Просмотр детальной информации о товаре
  bot.action(/^view_product_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    await showProductDetails(ctx, productId);
  });

  // Редактирование товара (главное меню)
  bot.action(/^edit_product_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    await showProductEditMenu(ctx, productId);
  });

  // Удаление товара (подтверждение)
  bot.action(/^delete_product_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    await showProductDeleteConfirmation(ctx, productId);
  });

  // Подтверждение удаления товара
  bot.action(/^confirm_delete_product_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    await deleteProduct(ctx, productId);
  });

  // Добавление нового товара
  bot.action('add_product', checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    await showCategorySelectionForNewProduct(ctx);
  });

  // Добавление товара в конкретную категорию
  bot.action(/^add_product_to_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = parseInt(ctx.match[1]);
    await startProductCreation(ctx, categoryId);
  });

  // Обработчики редактирования полей товара
  setupProductFieldEditHandlers(bot);

  // Подключаем поиск товаров
  setupProductSearch(bot);
};

// Показ выбора категории для просмотра товаров
const showCategorySelection = async (ctx) => {
  try {
    const categories = await categoryController.getAllCategories();
    
    if (categories.length === 0) {
      const keyboard = getCategorySelectionKeyboard([], true, false);
      return ctx.editMessageText(
        'Сначала добавьте категории.',
        {
          ...keyboard,
        }
      );
    }

    const keyboard = getCategorySelectionKeyboard(categories, false, true);
    await ctx.editMessageText(
      'Выберите категорию для просмотра/добавления товаров:',
      {
        ...keyboard,
      }
    );
  } catch (error) {
    console.error('Ошибка при показе категорий:', error);
    await ctx.reply('Произошла ошибка при получении списка категорий.');
  }
};

// Показ выбора категории для нового товара
const showCategorySelectionForNewProduct = async (ctx) => {
  try {
    const categories = await categoryController.getAllCategories();
    
    if (categories.length === 0) {
      const keyboard = getCategorySelectionKeyboard([], true, false);
      return ctx.editMessageText(
        'Сначала добавьте категории.',
        {
          ...keyboard,
        }
      );
    }

    const keyboard = getCategorySelectionKeyboard(categories, false, false, true);
    await ctx.editMessageText(
      'Выберите категорию для нового товара:',
      {
        ...keyboard,
      }
    );
  } catch (error) {
    console.error('Ошибка при показе категорий для нового товара:', error);
    await ctx.reply('Произошла ошибка при получении списка категорий.');
  }
};

// Показ меню редактирования товара
const showProductEditMenu = async (ctx, productId) => {
  try {
    const product = await productController.getProductById(productId);
    if (!product) {
      return ctx.editMessageText('Товар не найден.');
    }

    const message = getProductEditMessage(product.name);
    const keyboard = getProductEditKeyboard(productId, product.categoryId, product.name, product.productId);

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      ...keyboard,
    });
  } catch (error) {
    console.error('Ошибка при показе меню редактирования товара:', error);
    await ctx.editMessageText('Произошла ошибка.');
  }
};

// Показ подтверждения удаления товара
const showProductDeleteConfirmation = async (ctx, productId) => {
  try {
    const product = await productController.getProductById(productId);
    if (!product) {
      return ctx.editMessageText('Товар не найден.');
    }

    const message = getProductDeleteConfirmMessage(product.name, product.productId);
    const keyboard = getProductDeleteKeyboard(productId, product.name, product.productId);

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      ...keyboard,
    });
  } catch (error) {
    console.error('Ошибка при показе подтверждения удаления товара:', error);
    await ctx.editMessageText('Произошла ошибка.');
  }
};

// Удаление товара
const deleteProduct = async (ctx, productId) => {
  try {
    const product = await productController.getProductById(productId);
    if (!product) {
      return ctx.editMessageText('Товар не найден.');
    }

    const categoryId = product.categoryId;
    await productController.deleteProduct(productId);

    const message = getProductDeletedMessage(product.name, product.productId);
    const keyboard = getBackToProductsKeyboard(categoryId);

    await ctx.editMessageText(message, {
      ...keyboard,
    });
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    await ctx.editMessageText('Произошла ошибка при удалении товара.');
  }
};

// Начало создания нового товара
const startProductCreation = async (ctx, categoryId) => {
  setState(ctx.from.id, `wait_product_id_${categoryId}`);
  await ctx.reply(
  `🆔 Введите уникальный строковый идентификатор товара (productId) для связи с сайтом.\n\nВажно: от 3 до 20 символов, только буквы, цифры и дефисы!\n\n💡 Для отмены создания товара введите /cancel`
  );
};

// Настройка обработчиков редактирования полей товара
const setupProductFieldEditHandlers = (bot) => {
  // Редактирование productId
  bot.action(/^edit_product_id_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_id_${productId}`);
    await ctx.reply(getInputPrompts.editProductId);
  });

  // Редактирование названия
  bot.action(/^edit_product_name_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_name_${productId}`);
    await ctx.reply(getInputPrompts.productName);
  });

  // Редактирование цены
  bot.action(/^edit_product_price_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_price_${productId}`);
    await ctx.reply(getInputPrompts.productPrice);
  });

  // Редактирование описания
  bot.action(/^edit_product_description_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_description_${productId}`);
    await ctx.reply(getInputPrompts.productDescription);
  });

  // Редактирование характеристик
  bot.action(/^edit_product_specs_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_specs_${productId}`);
    await ctx.reply(getInputPrompts.productSpecs);
  });

  // Редактирование основного изображения
  bot.action(/^edit_product_image_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_image_${productId}`);
    await ctx.reply(getInputPrompts.productMainImage);
  });

  // Редактирование FPS изображения
  bot.action(/^edit_product_fps_image_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_fps_image_${productId}`);
    await ctx.reply(getInputPrompts.productFpsImage);
  });

  // Редактирование дополнительных изображений
  bot.action(/^edit_product_all_images_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_all_images_${productId}`);
    await ctx.reply(getInputPrompts.editProductAllImages);
  });

  // Редактирование видео (videoUrl)
  bot.action(/^edit_product_video_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_video_${productId}`);
    await ctx.reply(getInputPrompts.editProductVideoUrl);
  });

  // Редактирование FPS видео (fpsVideoUrl)
  bot.action(/^edit_product_fps_video_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_fps_video_${productId}`);
    await ctx.reply(getInputPrompts.editProductFpsVideoUrl);
  });

  // Редактирование ранга избранного
  bot.action(/^edit_product_rank_(\d+)$/, checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const productId = parseInt(ctx.match[1]);
    setState(ctx.from.id, `edit_rank_${productId}`);
    await ctx.reply(getInputPrompts.editProductRank);
  });
};

module.exports = {
  setupProductHandlers,
}; 