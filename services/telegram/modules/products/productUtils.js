const productController = require('../../../../controllers/productController');
const categoryController = require('../../../../controllers/categoryController');
const { PAGINATION } = require('../../core/config');
const { getPaginationInfo } = require('../../core/utils');
const { 
  getProductsInCategoryMessage,
  getProductListItemMessage,
  getProductDetailsMessage,
} = require('../../ui/messages');
const { 
  getProductListKeyboard,
  getProductViewKeyboard,
  getBackToCategoryKeyboard,
} = require('../../ui/keyboards');

// Функция отображения товаров с пагинацией
const showProductsPage = async (ctx, categoryId, page = 0, useEdit = true) => {
  try {
    const products = await productController.getProductsByCategory(categoryId);
    const category = await categoryController.getCategoryById(categoryId);
    
    if (!category) {
      return ctx.editMessageText('Категория не найдена.');
    }

    const pagination = getPaginationInfo(products, page, PAGINATION.PRODUCTS_PER_PAGE);
    const { currentPage, totalPages, pageItems: pageProducts, startIndex } = pagination;
    
    let message = getProductsInCategoryMessage(category.name, products, currentPage, totalPages);
    
    if (products.length === 0) {
      message += 'Товары отсутствуют.';
    } else {
      pageProducts.forEach((product, index) => {
        const globalIndex = startIndex + index + 1;
        message += getProductListItemMessage(product, globalIndex) + '\n';
      });
    }
    
    const hasSearch = products.length > 10;
    const keyboard = getProductListKeyboard(pageProducts, categoryId, currentPage, totalPages, hasSearch);
    
    // Используем edit или reply в зависимости от параметра
    if (useEdit) {
      try {
        await ctx.editMessageText(message, {
          parse_mode: 'HTML',
          ...keyboard,
        });
      } catch (editError) {
        if (editError.description && editError.description.includes("message can't be edited")) {
          // Если сообщение нельзя отредактировать, отправляем новое
          await ctx.reply(message, {
            parse_mode: 'HTML',
            ...keyboard,
          });
        } else {
          throw editError; // Пробрасываем другие ошибки
        }
      }
    } else {
      // Используем reply для новых сообщений
      await ctx.reply(message, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    }
  } catch (error) {
    console.error(`Ошибка при получении товаров категории ${categoryId}:`, error);
    if (useEdit) {
      try {
        await ctx.editMessageText('Произошла ошибка при получении товаров.');
      } catch {
        // Если не можем отредактировать, отправляем новое сообщение
        await ctx.reply('Произошла ошибка при получении товаров.');
      }
    } else {
      await ctx.reply('Произошла ошибка при получении товаров.');
    }
  }
};

// Функция показа деталей товара
const showProductDetails = async (ctx, productId) => {
  try {
    const product = await productController.getProductById(productId);
    if (!product) {
      const keyboard = getBackToCategoryKeyboard(null); // Без категории, так как товар не найден
      return ctx.editMessageText('Товар не найден.', keyboard);
    }

    const message = getProductDetailsMessage(product);
    const keyboard = getProductViewKeyboard(productId, product.categoryId);

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      ...keyboard,
    });
  } catch (error) {
    console.error('Ошибка при просмотре товара:', error);
    await ctx.editMessageText('Произошла ошибка при получении информации о товаре.');
  }
};

// Функция для валидации productId товара
const validateProductId = async (productId) => {
  try {
    const { PrismaClient } = require('../../../../generated/prisma');
    const prisma = new PrismaClient();
    const existingProduct = await prisma.product.findUnique({
      where: { productId: productId }
    });
    await prisma.$disconnect();
    return existingProduct !== null;
  } catch (error) {
    // Если товар не найден - productId свободен
    return false;
  }
};

// Функция для форматирования данных товара перед созданием
const formatProductData = (rawData) => {
  const formattedData = {
    productId: rawData.productId, // Строковый productId
    name: rawData.name.trim(),
    price: parseFloat(rawData.price),
    categoryId: parseInt(rawData.categoryId),
    favoriteRank: rawData.favoriteRank || 0,
  };

  // Добавляем опциональные поля только если они есть
  if (rawData.description && rawData.description !== 'null') {
    formattedData.description = rawData.description;
  }

  if (rawData.specs && rawData.specs !== 'null') {
    formattedData.specs = rawData.specs;
  }

  if (rawData.image && rawData.image !== 'null') {
    formattedData.image = rawData.image;
  }

  if (rawData.fpsImage && rawData.fpsImage !== 'null') {
    formattedData.fpsImage = rawData.fpsImage;
  }

  if (rawData.allImages && rawData.allImages !== 'null') {
    formattedData.allImages = rawData.allImages;
  }

  return formattedData;
};

// Функция для получения информации о создаваемом товаре из состояния
const parseProductCreationState = (state) => {
  const parts = state.split('|||');
  
  // Извлекаем базовую информацию в зависимости от шага
  if (state.startsWith('wait_product_name_')) {
    return {
      categoryId: parseInt(parts[0].replace('wait_product_name_', '')),
      productId: parts[1], // Строковый productId
    };
  }
  
  if (state.startsWith('wait_product_price_')) {
    return {
      categoryId: parseInt(parts[0].replace('wait_product_price_', '')),
      productId: parts[1], // Строковый productId
      name: parts[2],
    };
  }
  
  if (state.startsWith('wait_product_description_')) {
    return {
      categoryId: parseInt(parts[0].replace('wait_product_description_', '')),
      productId: parts[1], // Строковый productId
      name: parts[2],
      price: parseFloat(parts[3]),
    };
  }
  
  // Можно добавить другие состояния по мере необходимости
  return null;
};

// Функция для создания успешного сообщения о товаре
const formatProductCreatedMessage = (product, imageCount = 0) => {
  let message = `✅ <b>Товар успешно создан!</b>\n\n`;
  message += `🆔 <b>ProductId:</b> ${product.productId}\n`;
  message += `🏷️ <b>Название:</b> ${product.name}\n`;
  message += `💰 <b>Цена:</b> ${product.price.toLocaleString('ru-RU')} ₽\n`;
  
  if (product.favoriteRank > 0) {
    message += `⭐ <b>Ранг:</b> ${product.favoriteRank}/100\n`;
  }
  
  if (imageCount > 0) {
    message += `📸 <b>Изображений загружено:</b> ${imageCount}\n`;
  }
  
  if (product.description && product.description !== 'null') {
    const shortDesc = product.description.substring(0, 100);
    message += `📝 <b>Описание:</b> ${shortDesc}${product.description.length > 100 ? '...' : ''}\n`;
  }
  
  return message;
};

module.exports = {
  showProductsPage,
  showProductDetails,
  validateProductId,
  formatProductData,
  parseProductCreationState,
  formatProductCreatedMessage,
}; 