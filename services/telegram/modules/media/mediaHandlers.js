const { getState, clearState } = require('../../core/middlewares');
const { SUPPORTED_IMAGE_TYPES } = require('../../core/config');
const categoryController = require('../../../../controllers/categoryController');
const productController = require('../../../../controllers/productController');
const s3Service = require('../../../s3Service');
const { handleCreateCategoryWithoutImage } = require('../categories/categoryFSM');
const { showCategoryDetails } = require('../categories/categoryUtils');
const { showProductDetails } = require('../products/productUtils');
const { delay } = require('../../core/utils');

// Настройка обработчиков медиа
const setupMediaHandlers = (bot) => {
  // Обработка фото (со сжатием)
  bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const state = getState(userId);
    
    if (!state) return; // Игнорируем фото без состояния
    
    const photo = ctx.message.photo[ctx.message.photo.length - 1]; // Лучшее качество
    const fileId = photo.file_id;
    
    // Проверяем, является ли фото частью альбома
    if (ctx.message.media_group_id) {
      await handleMediaGroupPhoto(ctx, userId, state, fileId, ctx.message.media_group_id);
      return;
    }
    
    await handleSinglePhoto(ctx, userId, state, fileId);
  });

  // Обработка документов (изображений без сжатия)
  bot.on('document', async (ctx) => {
    const userId = ctx.from.id;
    const state = getState(userId);
    
    if (!state) return; // Игнорируем документы без состояния
    
    const document = ctx.message.document;
    
    // Проверяем, что это изображение
    if (!isValidImageDocument(document)) {
      return ctx.reply(
        '❌ Пожалуйста, отправьте изображение (JPEG, PNG, WebP или GIF).\n\n💡 Если отправляете как файл, убедитесь что это изображение'
      );
    }
    
    // Проверяем размер файла
    if (document.file_size > 20 * 1024 * 1024) {
      return ctx.reply(
        '❌ Изображение слишком большое (максимум 20MB).\n\nПопробуйте сжать изображение или отправить с галочкой "Сжать изображение".'
      );
    }
    
    const fileId = document.file_id;
    await handleSingleImage(ctx, userId, state, fileId, true); // true = файл без сжатия
  });
};

// Обработка одиночного фото
const handleSinglePhoto = async (ctx, userId, state, fileId) => {
  await handleSingleImage(ctx, userId, state, fileId, false); // false = фото со сжатием
};

// Обработка одиночного изображения (фото или документ)
const handleSingleImage = async (ctx, userId, state, fileId, isDocument = false) => {
  try {
    const qualityText = isDocument ? ' (загружено как файл)' : '';
    
    // === Обработка состояний категорий ===
    
    if (state.startsWith('wait_new_category_image|||')) {
      await handleNewCategoryImage(ctx, userId, state, fileId, qualityText);
      return;
    }
    
    if (state.startsWith('edit_category_image_')) {
      await handleEditCategoryImage(ctx, userId, state, fileId, qualityText);
      return;
    }
    
    // === Обработка состояний товаров ===
    
    if (state.startsWith('wait_product_image_')) {
      await handleNewProductMainImage(ctx, userId, state, fileId, qualityText);
      return;
    }
    
    if (state.startsWith('wait_product_fps_image_')) {
      await handleNewProductFpsImage(ctx, userId, state, fileId, qualityText);
      return;
    }
    
         if (state.startsWith('wait_product_all_images_')) {
       await handleNewProductAdditionalImage(ctx, userId, state, fileId, qualityText);
       return;
     }
     

    
    if (state.startsWith('edit_image_')) {
      await handleEditProductMainImage(ctx, userId, state, fileId, qualityText);
      return;
    }
    
    if (state.startsWith('edit_fps_image_')) {
      await handleEditProductFpsImage(ctx, userId, state, fileId, qualityText);
      return;
    }
    
    if (state.startsWith('edit_all_images_')) {
      await handleEditProductAdditionalImage(ctx, userId, state, fileId, qualityText);
      return;
    }
    
    // Если состояние не распознано
    return ctx.reply(
      '❌ Изображение сейчас не ожидается. Используйте кнопки меню для навигации.\n\n💡 Для отмены текущего действия введите /cancel'
    );
    
  } catch (error) {
    console.error('Ошибка при обработке изображения:', error);
    clearState(userId);
    await ctx.reply('❌ Произошла ошибка при обработке изображения.');
  }
};

// === Обработчики категорий ===

// Создание новой категории с изображением
const handleNewCategoryImage = async (ctx, userId, state, fileId, qualityText) => {
  const [_, name, description] = state.split('|||');
  
  try {
    let imageUrl = fileId;
    
    if (s3Service.isConfigured()) {
      await ctx.reply(`📤 Загружаю изображение категории в хранилище...${qualityText}`);
      const uploadResult = await s3Service.uploadCategoryImage({ fileId, categoryName: name });
      imageUrl = uploadResult.url;
    }
    
    const category = await categoryController.createCategory({
      name,
      description: description || null,
      image: imageUrl,
    });
    
    clearState(userId);
    await ctx.reply(`✅ Категория "${name}" успешно создана с изображением!${qualityText}`);
    
    await delay(500);
    const { showCategoriesList } = require('../categories/categoryUtils');
    await showCategoriesList(ctx, false);
    
  } catch (error) {
    console.error('Ошибка при создании категории с изображением:', error);
    clearState(userId);
    
    if (error.message.includes('unique') || error.message.includes('UNIQUE')) {
      await ctx.reply('❌ Категория с таким названием уже существует. Выберите другое название.');
    } else {
      await ctx.reply('❌ Ошибка при создании категории с изображением.');
    }
    
    const { showCategoriesList } = require('../categories/categoryUtils');
    await showCategoriesList(ctx, false);
  }
};

// Редактирование изображения категории
const handleEditCategoryImage = async (ctx, userId, state, fileId, qualityText) => {
  const categoryId = parseInt(state.replace('edit_category_image_', ''));
  
  try {
    let imageUrl = fileId;
    
    if (s3Service.isConfigured()) {
      await ctx.reply(`📤 Загружаю новое изображение категории в хранилище...${qualityText}`);
      const category = await categoryController.getCategoryById(categoryId);
      const uploadResult = await s3Service.uploadCategoryImage({ fileId, categoryName: category.name });
      imageUrl = uploadResult.url;
    }
    
    await categoryController.updateCategory(categoryId, { image: imageUrl });
    clearState(userId);
    await ctx.reply(`✅ Изображение категории обновлено!${qualityText}`);
    
    await delay(500);
    await showCategoryDetails(ctx, categoryId);
    
  } catch (error) {
    console.error('Ошибка при обновлении изображения категории:', error);
    clearState(userId);
    await ctx.reply('❌ Ошибка при обновлении изображения категории.');
  }
};

// === Обработчики товаров ===

// Основное изображение нового товара
const handleNewProductMainImage = async (ctx, userId, state, fileId, qualityText) => {
  const [categoryId, productId, productName, priceStr, description, specs] = state.replace('wait_product_image_', '').split('|||');
  
  const { setState } = require('../../core/middlewares');
  setState(userId, `wait_product_fps_image_${categoryId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${fileId}`);
  
  await ctx.reply(
    `✅ Основное изображение получено!${qualityText}\n\n🎮 Отправьте изображение с FPS тестами:\n\n📸 Фото (со сжатием) или 📎 Файл (без сжатия)\n\nИли "-" для пропуска:\n\n💡 Для отмены введите /cancel`
  );
};

// FPS изображение нового товара
const handleNewProductFpsImage = async (ctx, userId, state, fileId, qualityText) => {
  const [categoryId, productId, productName, priceStr, description, specs, image] = state.replace('wait_product_fps_image_', '').split('|||');
  
  const { setState } = require('../../core/middlewares');
  setState(userId, `wait_product_all_images_${categoryId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${image}|||${fileId}`);
  
  await ctx.reply(
    `✅ FPS изображение получено!${qualityText}\n\n📸 Отправляйте дополнительные изображения товара:\n\n• 🖼️ По одному (фото или файлы)\n• 📚 Альбомом до 10 изображений сразу\n\nКогда закончите, напишите "готово" или "-" для пропуска:\n\n💡 Для отмены введите /cancel`
  );
};

// Дополнительное изображение нового товара
const handleNewProductAdditionalImage = async (ctx, userId, state, fileId, qualityText) => {
  const stateParts = state.replace('wait_product_all_images_', '').split('|||');
  const [categoryId, productId, productName, priceStr, description, specs, image, fpsImage] = stateParts.slice(0, 8);
  const existingImages = stateParts.slice(8) || [];
  
  const updatedImages = [...existingImages, fileId];
  const newState = `wait_product_all_images_${categoryId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${image}|||${fpsImage}|||${updatedImages.join('|||')}`;
  
  const { setState } = require('../../core/middlewares');
  setState(userId, newState);
  
  await ctx.reply(
    `✅ Дополнительное изображение ${updatedImages.length} получено!${qualityText}\n\n📸 Отправьте еще изображения:\n• Одиночными или альбомом\n• Или напишите "готово" для завершения\n\n💡 Для отмены введите /cancel`
  );
};

// Редактирование основного изображения товара
const handleEditProductMainImage = async (ctx, userId, state, fileId, qualityText) => {
  const productId = parseInt(state.replace('edit_image_', ''));
  
  try {
    await ctx.reply(`📤 Загружаю изображение в хранилище...${qualityText}`);
    
    let newImageUrl = fileId;
    
    if (s3Service.isConfigured()) {
      const product = await productController.getProductById(productId);
      if (!product) throw new Error('Товар не найден');
      
      const category = await categoryController.getCategoryById(product.categoryId);
      if (!category) throw new Error('Категория не найдена');
      
      const uploadResult = await s3Service.uploadProductImages({
        mainImage: fileId,
        fpsImage: null,
        additionalImages: null,
        productInfo: {
          productId: productId,
          productName: product.name,
          categoryId: product.categoryId,
          categoryName: category.name
        }
      });
      
      newImageUrl = uploadResult.mainImageUrl;
    }
    
    await productController.updateProduct(productId, { image: newImageUrl });
    clearState(userId);
    await ctx.reply(`✅ Основное изображение обновлено!${qualityText}`);
    
    await delay(500);
    await showProductDetails(ctx, productId);
    
  } catch (error) {
    console.error('Ошибка при обновлении основного изображения:', error);
    clearState(userId);
    await ctx.reply('❌ Произошла ошибка при обновлении изображения.');
  }
};

// Редактирование FPS изображения товара
const handleEditProductFpsImage = async (ctx, userId, state, fileId, qualityText) => {
  const productId = parseInt(state.replace('edit_fps_image_', ''));
  
  try {
    await ctx.reply(`📤 Загружаю FPS изображение в хранилище...${qualityText}`);
    
    let newFpsImageUrl = fileId;
    
    if (s3Service.isConfigured()) {
      const product = await productController.getProductById(productId);
      if (!product) throw new Error('Товар не найден');
      
      const category = await categoryController.getCategoryById(product.categoryId);
      if (!category) throw new Error('Категория не найдена');
      
      const uploadResult = await s3Service.uploadProductImages({
        mainImage: null,
        fpsImage: fileId,
        additionalImages: null,
        productInfo: {
          productId: productId,
          productName: product.name,
          categoryId: product.categoryId,
          categoryName: category.name
        }
      });
      
      newFpsImageUrl = uploadResult.fpsImageUrl;
    }
    
    await productController.updateProduct(productId, { fpsImage: newFpsImageUrl });
    clearState(userId);
    await ctx.reply(`✅ FPS изображение обновлено!${qualityText}`);
    
    await delay(500);
    await showProductDetails(ctx, productId);
    
  } catch (error) {
    console.error('Ошибка при обновлении FPS изображения:', error);
    clearState(userId);
    await ctx.reply('❌ Произошла ошибка при обновлении FPS изображения.');
  }
};

// Редактирование дополнительных изображений товара
const handleEditProductAdditionalImage = async (ctx, userId, state, fileId, qualityText) => {
  const stateParts = state.replace('edit_all_images_', '').split('|||');
  const productId = parseInt(stateParts[0]);
  const existingImages = stateParts.slice(1) || [];
  
  const updatedImages = [...existingImages, fileId];
  const newState = `edit_all_images_${productId}|||${updatedImages.join('|||')}`;
  
  const { setState } = require('../../core/middlewares');
  setState(userId, newState);
  
  await ctx.reply(
    `✅ Дополнительное изображение ${updatedImages.length} получено!${qualityText}\n\n📸 Отправьте еще изображения или напишите "готово" для сохранения:\n\n💡 Для отмены введите /cancel`
  );
};



// === Обработка альбомов (медиа-групп) ===

// Обработка альбомов изображений (медиа-групп)
const handleMediaGroupPhoto = async (ctx, userId, state, fileId, mediaGroupId) => {
  // Для дополнительных изображений товара можем обрабатывать альбом
  if (state.startsWith('wait_product_all_images_') || state.startsWith('edit_all_images_')) {
    // Добавляем изображение из альбома как обычное
    await handleSinglePhoto(ctx, userId, state, fileId);
    
    // Отправляем уведомление о получении фото из альбома
    await ctx.reply(`✅ Изображение из альбома получено! Продолжайте отправлять изображения или напишите "готово" для завершения.`);
    return;
  }
  
  // Для остальных состояний обрабатываем как одиночное фото
  await handleSinglePhoto(ctx, userId, state, fileId);
};

// === Вспомогательные функции ===

// Проверка валидности документа-изображения
const isValidImageDocument = (document) => {
  if (!document.mime_type) return false;
  return SUPPORTED_IMAGE_TYPES.includes(document.mime_type.toLowerCase());
};

// Обработка текстовых команд пропуска изображений
const handleImageSkipCommand = async (ctx, userId, state, text) => {
  if (text !== '-') return false;
  
  try {
    // === Пропуск изображения категории ===
    if (state.startsWith('wait_new_category_image|||')) {
      const [_, name, description] = state.split('|||');
      await handleCreateCategoryWithoutImage(ctx, userId, name, description);
      return true;
    }
    
    if (state.startsWith('edit_category_image_')) {
      const categoryId = parseInt(state.replace('edit_category_image_', ''));
      await categoryController.updateCategory(categoryId, { image: null });
      clearState(userId);
      await ctx.reply('✅ Изображение категории удалено');
      
      await delay(500);
      await showCategoryDetails(ctx, categoryId);
      return true;
    }
    
         // === Пропуск изображений товара ===
     if (state.startsWith('wait_product_image_')) {
       const [categoryId, productId, productName, priceStr, description, specs] = state.replace('wait_product_image_', '').split('|||');
       
       const { setState } = require('../../core/middlewares');
       setState(userId, `wait_product_fps_image_${categoryId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||null`);
       
       await ctx.reply(
         '🎮 Отправьте изображение с FPS тестами:\n\n📸 Фото (со сжатием) или 📎 Файл (без сжатия)\n\nИли "-" для пропуска:\n\n💡 Для отмены введите /cancel'
       );
       return true;
     }
     
     if (state.startsWith('wait_product_fps_image_')) {
       const [categoryId, productId, productName, priceStr, description, specs, image] = state.replace('wait_product_fps_image_', '').split('|||');
       
       const { setState } = require('../../core/middlewares');
       setState(userId, `wait_product_all_images_${categoryId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${image}|||null`);
       
       await ctx.reply(
         '📸 Отправляйте дополнительные изображения товара:\n\n• 🖼️ По одному (фото или файлы)\n• 📚 Альбомом до 10 изображений сразу\n\nКогда закончите, напишите "готово" или "-" для пропуска:\n\n💡 Для отмены введите /cancel'
       );
       return true;
     }
     
     // === Пропуск/удаление изображений при редактировании ===
     if (state.startsWith('edit_image_')) {
       const productId = parseInt(state.replace('edit_image_', ''));
       await productController.updateProduct(productId, { image: null });
       clearState(userId);
       await ctx.reply('✅ Основное изображение удалено');
       
       await delay(500);
       await showProductDetails(ctx, productId);
       return true;
     }
     
     if (state.startsWith('edit_fps_image_')) {
       const productId = parseInt(state.replace('edit_fps_image_', ''));
       await productController.updateProduct(productId, { fpsImage: null });
       clearState(userId);
       await ctx.reply('✅ FPS изображение удалено');
       
       await delay(500);
       await showProductDetails(ctx, productId);
       return true;
     }
         
     // === Завершение добавления дополнительных изображений для нового товара ===
     if (state.startsWith('wait_product_all_images_')) {
       const stateParts = state.replace('wait_product_all_images_', '').split('|||');
       const [categoryId, productId, productName, priceStr, description, specs, image, fpsImage] = stateParts.slice(0, 8);
       
       // Если нет накопленных изображений, переходим к рангу
       let allImagesJson = null;
       const existingImages = stateParts.slice(8) || [];
       if (existingImages.length > 0) {
         allImagesJson = JSON.stringify(existingImages);
       }
       
       const { setState } = require('../../core/middlewares');
       setState(userId, `wait_product_rank_${categoryId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${image}|||${fpsImage}|||${allImagesJson || 'null'}`);
       
       await ctx.reply(
         `⭐ Введите ранг товара для "лучших предложений" (0-100, где 0 = обычный товар, 100 = топ предложение):\n\nИли "-" для установки 0:\n\n💡 Для отмены введите /cancel`
       );
       return true;
     }
     
     // Добавить другие обработчики пропуска по мере необходимости
    
  } catch (error) {
    console.error('Ошибка при пропуске изображения:', error);
    clearState(userId);
    await ctx.reply('❌ Произошла ошибка.');
  }
  
  return false;
};

module.exports = {
  setupMediaHandlers,
  handleImageSkipCommand, // Экспортируем для использования в FSM обработчиках
}; 