const { clearState } = require('../../core/middlewares');
const { validateText, validatePrice, validateSpecs, delay } = require('../../core/utils');
const { LIMITS } = require('../../core/config');
const productController = require('../../../../controllers/productController');
const { showProductsPage, showProductDetails, validateProductId, formatProductCreatedMessage } = require('./productUtils');
const { 
  getErrorMessages, 
  getSuccessMessages,
  getInputPrompts,
} = require('../../ui/messages');

// Обработка FSM для товаров
const handleProductFSM = async (ctx, userId, state, text, webAppUrl) => {
  try {
    // FSM для создания нового товара
    if (state.startsWith('wait_product_id_')) {
      await handleProductId(ctx, userId, state, text);
      return;
    }

    if (state.startsWith('wait_product_name_')) {
      await handleProductName(ctx, userId, state, text);
      return;
    }

    if (state.startsWith('wait_product_price_')) {
      await handleProductPrice(ctx, userId, state, text);
      return;
    }

    if (state.startsWith('wait_product_description_')) {
      await handleProductDescription(ctx, userId, state, text);
      return;
    }

    if (state.startsWith('wait_product_specs_')) {
      await handleProductSpecs(ctx, userId, state, text);
      return;
    }

    if (state.startsWith('wait_product_rank_')) {
      await handleProductRank(ctx, userId, state, text);
      return;
    }

    // FSM для завершения добавления дополнительных изображений
    if (state.startsWith('wait_product_all_images_')) {
      await handleProductAdditionalImagesComplete(ctx, userId, state, text);
      return;
    }

    // FSM для редактирования дополнительных изображений (команды завершения)
    if (state.startsWith('edit_all_images_')) {
      await handleEditAdditionalImagesComplete(ctx, userId, state, text);
      return;
    }

    // FSM для редактирования товаров
    if (state.startsWith('edit_id_')) {
      await handleEditProductId(ctx, userId, state, text);
      return;
    }

    if (state.startsWith('edit_name_')) {
      await handleEditProductName(ctx, userId, state, text);
      return;
    }

    if (state.startsWith('edit_price_')) {
      await handleEditProductPrice(ctx, userId, state, text);
      return;
    }

    if (state.startsWith('edit_description_')) {
      await handleEditProductDescription(ctx, userId, state, text);
      return;
    }

    if (state.startsWith('edit_specs_')) {
      await handleEditProductSpecs(ctx, userId, state, text);
      return;
    }

    if (state.startsWith('edit_rank_')) {
      await handleEditProductRank(ctx, userId, state, text);
      return;
    }

    // FSM для обработки изображений товара
    if (state.includes('image')) {
      await handleProductImageFSM(ctx, userId, state, text);
      return;
    }

    console.warn(`[PRODUCT FSM] Неизвестное состояние: ${state}`);
    clearState(userId);
  } catch (error) {
    console.error('[PRODUCT FSM] Ошибка:', error);
    clearState(userId);
    await ctx.reply('Произошла ошибка при обработке данных товара.');
  }
};

// === Создание нового товара ===

// Шаг 1: Обработка productId товара
const handleProductId = async (ctx, userId, state, text) => {
  const categoryId = parseInt(state.replace('wait_product_id_', ''));
  const productId = text.trim();
  
  if (!productId || productId.length < 3 || productId.length > 20) {
    return ctx.reply('❌ ProductId должен быть от 3 до 20 символов!\n\nВведите уникальный строковый идентификатор товара для связи с сайтом:\n\n💡 Для отмены введите /cancel');
  }
  
  // Проверяем уникальность productId
  try {
    const { PrismaClient } = require('../../../../../generated/prisma');
    const prisma = new PrismaClient();
    const exists = await prisma.product.findUnique({
      where: { productId: productId }
    });
    await prisma.$disconnect();
    
    if (exists) {
      return ctx.reply(`❌ Товар с productId "${productId}" уже существует!\n\nВведите другой уникальный productId:\n\n💡 Для отмены введите /cancel`);
    }
  } catch (error) {
    console.error('Ошибка при проверке productId товара:', error);
  }
  
  const { setState } = require('../../core/middlewares');
  setState(userId, `wait_product_name_${categoryId}|||${productId}`);
  return ctx.reply(getInputPrompts.productName);
};

// Шаг 2: Обработка названия товара
const handleProductName = async (ctx, userId, state, text) => {
  const [categoryId, productId] = state.replace('wait_product_name_', '').split('|||');
  
  const validation = validateText(text, LIMITS.PRODUCT_NAME.min, LIMITS.PRODUCT_NAME.max);
  if (!validation.isValid) {
    return ctx.reply(getErrorMessages.productNameLength);
  }

  const { setState } = require('../../core/middlewares');
  setState(userId, `wait_product_price_${categoryId}|||${productId}|||${text}`);
  return ctx.reply(getInputPrompts.productPrice);
};

// Шаг 3: Обработка цены товара
const handleProductPrice = async (ctx, userId, state, text) => {
  const [categoryId, productId, productName] = state.replace('wait_product_price_', '').split('|||');

  const validation = validatePrice(text);
  if (!validation.isValid) {
    return ctx.reply(getErrorMessages.invalidPrice);
  }

  const { setState } = require('../../core/middlewares');
  setState(userId, `wait_product_description_${categoryId}|||${productId}|||${productName}|||${validation.price}`);
  return ctx.reply(getInputPrompts.productDescription);
};

// Шаг 4: Обработка описания товара
const handleProductDescription = async (ctx, userId, state, text) => {
  const [categoryId, productId, productName, priceStr] = state.replace('wait_product_description_', '').split('|||');
  const description = text === '-' ? null : text;
  
  const { setState } = require('../../core/middlewares');
  setState(userId, `wait_product_specs_${categoryId}|||${productId}|||${productName}|||${priceStr}|||${description || 'null'}`);
  return ctx.reply(getInputPrompts.productSpecs);
};

// Шаг 5: Обработка характеристик товара
const handleProductSpecs = async (ctx, userId, state, text) => {
  const [categoryId, productId, productName, priceStr, description] = state.replace('wait_product_specs_', '').split('|||');
  
  let specs = null;
  if (text !== '-') {
    const validation = validateSpecs(text);
    if (!validation.isValid) {
      return ctx.reply(validation.error);
    }
    specs = validation.specs;
  }
  
  const { setState } = require('../../core/middlewares');
  setState(userId, `wait_product_image_${categoryId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs || 'null'}`);
  return ctx.reply(getInputPrompts.productMainImage);
};

// Шаг 6: Обработка ранга избранного
const handleProductRank = async (ctx, userId, state, text) => {
  const parts = state.replace('wait_product_rank_', '').split('|||');
  const [categoryId, productId, productName, priceStr, description, specs, image, fpsImage, allImages] = parts;
  
  let favoriteRank = 0;
  if (text !== '-') {
    favoriteRank = parseInt(text);
    if (isNaN(favoriteRank) || favoriteRank < 0 || favoriteRank > 100) {
      return ctx.reply(getErrorMessages.invalidFavoriteRank);
    }
  }

  // Создаем товар
  await createProduct(ctx, userId, {
    categoryId: parseInt(categoryId),
    productId: productId,
    name: productName,
    price: parseFloat(priceStr),
    description: description === 'null' ? null : description,
    specs: specs === 'null' ? null : specs,
    image: image === 'null' ? null : image,
    fpsImage: fpsImage === 'null' ? null : fpsImage,
    allImages: allImages === 'null' ? null : allImages,
    favoriteRank
  });
};

// === Редактирование товаров ===

// Редактирование productId товара
const handleEditProductId = async (ctx, userId, state, text) => {
  const productId = parseInt(state.replace('edit_id_', ''));
  const newProductId = text.trim();
  
  if (!newProductId || newProductId.length < 3 || newProductId.length > 20) {
    return ctx.reply('❌ ProductId должен быть от 3 до 20 символов!\n\nВведите новый уникальный строковый идентификатор товара:\n\n💡 Для отмены введите /cancel');
  }
  
  // Проверяем уникальность нового productId
  try {
    const { PrismaClient } = require('../../../../../generated/prisma');
    const prisma = new PrismaClient();
    const existingProduct = await prisma.product.findUnique({
      where: { productId: newProductId }
    });
    await prisma.$disconnect();
    
    if (existingProduct && existingProduct.id !== productId) {
      return ctx.reply(`❌ Товар с productId "${newProductId}" уже существует!\n\nВведите другой уникальный productId:\n\n💡 Для отмены введите /cancel`);
    }
  } catch (error) {
    console.error('Ошибка при проверке productId товара:', error);
  }
  
  try {
    await productController.updateProduct(productId, { productId: newProductId });
    clearState(userId);
    await ctx.reply(`✅ ProductId товара обновлен на: ${newProductId}`);
    
    await delay(500);
    await showProductDetails(ctx, productId);
  } catch (error) {
    console.error('Ошибка при обновлении productId товара:', error);
    clearState(userId);
    await ctx.reply('❌ Произошла ошибка при обновлении productId.');
  }
};

// Редактирование названия товара
const handleEditProductName = async (ctx, userId, state, text) => {
  const productId = parseInt(state.replace('edit_name_', ''));
  
  const validation = validateText(text, LIMITS.PRODUCT_NAME.min, LIMITS.PRODUCT_NAME.max);
  if (!validation.isValid) {
    return ctx.reply(getErrorMessages.productNameLength);
  }
  
  try {
    await productController.updateProduct(productId, { name: text.trim() });
    clearState(userId);
    await ctx.reply(getSuccessMessages.productUpdated('Название'));
    
    await delay(500);
    await showProductDetails(ctx, productId);
  } catch (error) {
    console.error('Ошибка при обновлении названия товара:', error);
    clearState(userId);
    await ctx.reply('❌ Произошла ошибка при обновлении названия.');
  }
};

// Редактирование цены товара
const handleEditProductPrice = async (ctx, userId, state, text) => {
  const productId = parseInt(state.replace('edit_price_', ''));
  
  const validation = validatePrice(text);
  if (!validation.isValid) {
    return ctx.reply(getErrorMessages.invalidPrice);
  }
  
  try {
    await productController.updateProduct(productId, { price: validation.price });
    clearState(userId);
    await ctx.reply(`✅ Цена товара обновлена на: ${validation.price.toLocaleString('ru-RU')} ₽`);
    
    await delay(500);
    await showProductDetails(ctx, productId);
  } catch (error) {
    console.error('Ошибка при обновлении цены товара:', error);
    clearState(userId);
    await ctx.reply('❌ Произошла ошибка при обновлении цены.');
  }
};

// Редактирование описания товара
const handleEditProductDescription = async (ctx, userId, state, text) => {
  const productId = parseInt(state.replace('edit_description_', ''));
  const description = text === '-' ? null : text.trim();
  
  try {
    await productController.updateProduct(productId, { description });
    clearState(userId);
    
    const updateMessage = description ? 'обновлено' : 'удалено';
    await ctx.reply(`✅ Описание товара ${updateMessage}`);
    
    await delay(500);
    await showProductDetails(ctx, productId);
  } catch (error) {
    console.error('Ошибка при обновлении описания товара:', error);
    clearState(userId);
    await ctx.reply('❌ Произошла ошибка при обновлении описания.');
  }
};

// Редактирование характеристик товара
const handleEditProductSpecs = async (ctx, userId, state, text) => {
  const productId = parseInt(state.replace('edit_specs_', ''));
  
  let specs = null;
  if (text !== '-') {
    const validation = validateSpecs(text);
    if (!validation.isValid) {
      return ctx.reply(validation.error);
    }
    specs = validation.specs;
  }
  
  try {
    await productController.updateProduct(productId, { specs });
    clearState(userId);
    
    const updateMessage = specs ? 'обновлены' : 'удалены';
    await ctx.reply(`✅ Характеристики товара ${updateMessage}`);
    
    await delay(500);
    await showProductDetails(ctx, productId);
  } catch (error) {
    console.error('Ошибка при обновлении характеристик товара:', error);
    clearState(userId);
    await ctx.reply('❌ Произошла ошибка при обновлении характеристик.');
  }
};

// Редактирование ранга избранного
const handleEditProductRank = async (ctx, userId, state, text) => {
  const productId = parseInt(state.replace('edit_rank_', ''));
  
  let favoriteRank = 0;
  if (text !== '-') {
    favoriteRank = parseInt(text);
    if (isNaN(favoriteRank) || favoriteRank < 0 || favoriteRank > 100) {
      return ctx.reply(getErrorMessages.invalidFavoriteRank);
    }
  }
  
  try {
    await productController.updateProduct(productId, { favoriteRank });
    clearState(userId);
    await ctx.reply(`✅ Ранг избранного обновлен на: ${favoriteRank}`);
    
    await delay(500);
    await showProductDetails(ctx, productId);
  } catch (error) {
    console.error('Ошибка при обновлении ранга товара:', error);
    clearState(userId);
    await ctx.reply('❌ Произошла ошибка при обновлении ранга.');
  }
};

// === Вспомогательные функции ===

// Создание товара с полной S3 интеграцией
const createProduct = async (ctx, userId, productData) => {
  try {
    console.log('Создание товара с данными:', productData);
    
    await ctx.reply('📤 Загружаю изображения в хранилище...');
    
    // Загружаем все изображения в S3
    let uploadedImages = {};
    
    const s3Service = require('../../../s3Service');
    if (s3Service.isConfigured()) {
      // Получаем информацию о категории для правильной организации файлов
      const categoryController = require('../../../../controllers/categoryController');
      const category = await categoryController.getCategoryById(productData.categoryId);
      if (!category) {
        throw new Error(`Категория с ID ${productData.categoryId} не найдена`);
      }
      
      uploadedImages = await s3Service.uploadProductImages({
        mainImage: productData.image === 'null' ? null : productData.image,
        fpsImage: productData.fpsImage === 'null' ? null : productData.fpsImage,
        additionalImages: productData.allImages === 'null' ? null : productData.allImages,
        productInfo: {
          productId: productData.productId,
          productName: productData.name,
          categoryId: productData.categoryId,
          categoryName: category.name
        }
      });
      console.log('Изображения загружены в S3:', uploadedImages);
    } else {
      console.warn('S3 не настроен, сохраняем file_id в базу данных');
      // Если S3 не настроен, сохраняем file_id как есть (для разработки)
      uploadedImages = {
        mainImageUrl: productData.image === 'null' ? null : productData.image,
        fpsImageUrl: productData.fpsImage === 'null' ? null : productData.fpsImage,
        additionalImagesUrls: productData.allImages === 'null' ? null : productData.allImages
      };
    }

    // Формируем данные для создания товара с S3 ссылками
    const finalProductData = {
      productId: productData.productId,
      name: productData.name,
      price: productData.price,
      description: productData.description,
      specs: productData.specs,
      image: uploadedImages.mainImageUrl,
      fpsImage: uploadedImages.fpsImageUrl,
      allImages: uploadedImages.additionalImagesUrls,
      favoriteRank: productData.favoriteRank,
      categoryId: productData.categoryId,
    };

    console.log('Создаем товар с загруженными изображениями:', finalProductData);
    
    const product = await productController.createProduct(finalProductData);
    clearState(userId);
    
    // Подсчитываем количество изображений
    let imageCount = 0;
    if (uploadedImages.mainImageUrl) imageCount++;
    if (uploadedImages.fpsImageUrl) imageCount++;
    if (uploadedImages.additionalImagesUrls) {
      try {
        const additionalUrls = JSON.parse(uploadedImages.additionalImagesUrls);
        imageCount += additionalUrls.length;
      } catch (e) {}
    }
    
    // Формируем сообщение с полной информацией о созданном товаре
    let successMessage = `✅ <b>Товар успешно создан!</b>\n\n`;
    successMessage += `🆔 <b>ProductId:</b> ${productData.productId}\n`;
    successMessage += `🏷️ <b>Название:</b> ${productData.name}\n`;
    successMessage += `💰 <b>Цена:</b> ${productData.price.toLocaleString('ru-RU')} ₽\n`;
    
    if (productData.favoriteRank > 0) {
      successMessage += `⭐ <b>Ранг:</b> ${productData.favoriteRank}/100\n`;
    }
    
    // Информация о загруженных изображениях
    if (imageCount > 0) {
      successMessage += `📸 <b>Изображений загружено:</b> ${imageCount}\n`;
    }
    
    if (productData.description && productData.description !== 'null') {
      successMessage += `📝 <b>Описание:</b> ${productData.description.substring(0, 100)}${productData.description.length > 100 ? '...' : ''}\n`;
    }
    
    // Показываем характеристики если есть
    if (productData.specs && productData.specs !== 'null') {
      try {
        const specsObj = JSON.parse(productData.specs);
        const specsDisplay = Object.entries(specsObj).map(([key, value]) => `${key}: ${value}`).join('\n');
        successMessage += `📋 <b>Характеристики:</b>\n${specsDisplay.substring(0, 200)}${specsDisplay.length > 200 ? '...' : ''}\n`;
      } catch (e) {
        console.error('Ошибка при парсинге specs:', e);
      }
    }
    
    await ctx.reply(successMessage, { parse_mode: 'HTML' });
    
    // Возвращаемся к списку товаров категории
    await delay(1000);
    await showProductsPage(ctx, productData.categoryId, 0, false); // false = использовать reply вместо edit
    
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    clearState(userId);
    
    let errorMessage = '❌ Произошла ошибка при создании товара:\n\n';
    
    if (error.message.includes('S3')) {
      errorMessage += '📤 Ошибка загрузки изображений в хранилище.\nПроверьте настройки S3 или попробуйте позже.';
    } else if (error.message.includes('unique') || error.message.includes('UNIQUE')) {
      errorMessage += `🆔 Товар с productId "${productData.productId}" уже существует!\nВыберите другой productId.`;
    } else if (error.message.includes('file_id') || error.message.includes('Telegram')) {
      errorMessage += '📸 Ошибка обработки изображений.\nПопробуйте отправить изображения заново.';
    } else {
      errorMessage += 'Неизвестная ошибка. Проверьте данные или попробуйте позже.';
    }
    
    errorMessage += '\n\n💡 Создание товара отменено. Для новой попытки используйте /admin';
    
    await ctx.reply(errorMessage);
  }
};

// Обработка завершения добавления дополнительных изображений для нового товара
const handleProductAdditionalImagesComplete = async (ctx, userId, state, text) => {
  const stateParts = state.replace('wait_product_all_images_', '').split('|||');
  const [categoryId, productId, productName, priceStr, description, specs, image, fpsImage] = stateParts.slice(0, 8);
  const existingImages = stateParts.slice(8) || [];
  
  // Проверяем команды завершения или пропуска
  if (text === 'готово' || text === '-') {
    let allImagesJson = null;
    if (existingImages.length > 0) {
      allImagesJson = JSON.stringify(existingImages);
    }
    
    const { setState } = require('../../core/middlewares');
    setState(userId, `wait_product_rank_${categoryId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${image}|||${fpsImage}|||${allImagesJson || 'null'}`);
    
    return ctx.reply(
      `⭐ Введите ранг товара для "лучших предложений" (0-100, где 0 = обычный товар, 100 = топ предложение):\n\nИли "-" для установки 0:\n\n💡 Для отмены введите /cancel`
    );
  }
  
  // Если не команда завершения, просим отправить изображение или завершить
  return ctx.reply(
    '❌ Пожалуйста, отправьте изображение (📸 фото или 📎 файл), напишите "готово" для завершения или "-" для пропуска.\n\n💡 Для отмены введите /cancel'
  );
};

// Обработка команд для редактирования дополнительных изображений
const handleEditAdditionalImagesComplete = async (ctx, userId, state, text) => {
  const stateParts = state.replace('edit_all_images_', '').split('|||');
  const productId = parseInt(stateParts[0]);
  const newImages = stateParts.slice(1) || [];
  
  // Проверяем команду "готово"
  if (text === 'готово') {
    try {
      if (newImages.length === 0) {
        // Если нет накопленных изображений, завершаем без изменений
        clearState(userId);
        await ctx.reply('✅ Редактирование дополнительных изображений завершено без изменений');
      } else {
        // Показываем сообщение о начале загрузки
        await ctx.reply(`📤 Загружаю ${newImages.length} дополнительных изображений в хранилище...`);
        
        // Загружаем изображения в S3
        let newAllImagesJson = JSON.stringify(newImages); // Значение по умолчанию если S3 не настроен
        
        const s3Service = require('../../../s3Service');
        if (s3Service.isConfigured()) {
          // Получаем информацию о товаре для правильной организации файлов
          const product = await productController.getProductById(productId);
          if (!product) {
            throw new Error('Товар не найден');
          }
          
          const categoryController = require('../../../../controllers/categoryController');
          const category = await categoryController.getCategoryById(product.categoryId);
          if (!category) {
            throw new Error('Категория не найдена');
          }
          
          const uploadResult = await s3Service.uploadProductImages({
            mainImage: null,
            fpsImage: null,
            additionalImages: JSON.stringify(newImages),
            productInfo: {
              productId: productId,
              productName: product.name,
              categoryId: product.categoryId,
              categoryName: category.name
            }
          });
          
          newAllImagesJson = uploadResult.additionalImagesUrls;
        }
        
        await productController.updateProduct(productId, { allImages: newAllImagesJson });
        clearState(userId);
        await ctx.reply(`✅ ${newImages.length} дополнительных изображений обновлены!`);
      }
      
      // Возвращаемся к просмотру товара
      await delay(500);
      await showProductDetails(ctx, productId);
      
    } catch (error) {
      console.error('Ошибка при обновлении дополнительных изображений:', error);
      clearState(userId);
      await ctx.reply('❌ Произошла ошибка при обновлении дополнительных изображений.');
    }
    return;
  }
  
  // Проверяем команду "удалить"
  if (text === 'удалить') {
    try {
      await productController.updateProduct(productId, { allImages: null });
      clearState(userId);
      await ctx.reply('✅ Все дополнительные изображения удалены');
      
      // Возвращаемся к просмотру товара
      await delay(500);
      await showProductDetails(ctx, productId);
      
    } catch (error) {
      console.error('Ошибка при удалении доп. изображений:', error);
      clearState(userId);
      await ctx.reply('❌ Произошла ошибка при удалении дополнительных изображений.');
    }
    return;
  }
  
  // Если не команда завершения
  return ctx.reply(
    '❌ Пожалуйста, отправьте изображения, напишите "готово" для завершения или "удалить" для удаления всех доп. изображений.\n\n💡 Для отмены введите /cancel'
  );
};

// Обработка FSM для изображений товара
const handleProductImageFSM = async (ctx, userId, state, text) => {
  // Проверяем команду пропуска через медиа модуль
  const { handleImageSkipCommand } = require('../media/mediaHandlers');
  const wasHandled = await handleImageSkipCommand(ctx, userId, state, text);
  
  if (wasHandled) return;
  
  // Если не команда пропуска, просим отправить изображение
  return ctx.reply('❌ Пожалуйста, отправьте изображение (📸 фото или 📎 файл) или "-" для пропуска/удаления.\n\n💡 Для отмены введите /cancel');
};

module.exports = {
  handleProductFSM,
}; 