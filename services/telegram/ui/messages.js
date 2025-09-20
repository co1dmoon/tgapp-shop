const { CONTACT_INFO } = require('../core/config');
const { formatPrice, formatDate, formatDateTime, formatSpecsForDisplay } = require('../core/utils');

// Приветственные сообщения
const getWelcomeMessage = (userName) => {
  return `👋 Привет, ${userName}! Добро пожаловать в компьютерный магазин B-ZONE.\n Выберите действие:`;
};

// Сообщения контактов
const getContactMessage = () => {
  return `<b>Свяжитесь с нами:</b>

📱 Телефон: <a href="tel:${CONTACT_INFO.phone}">${CONTACT_INFO.phone}</a>
📧 Email: <a href="mailto:${CONTACT_INFO.email}">${CONTACT_INFO.email}</a>
💬 Telegram: <a href="https://t.me/${CONTACT_INFO.telegram.replace('@', '')}">${CONTACT_INFO.telegram}</a>
🌐 Сайт: <a href="${CONTACT_INFO.website}">${CONTACT_INFO.website}</a>`;
};

// Сообщения каталога
const getCatalogMessage = () => {
  return 'Нажмите кнопку ниже, чтобы открыть каталог:';
};

// Сообщения админки
const getAdminPanelMessage = () => {
  return '<b>Панель администратора:</b>';
};

// Сообщения категорий
const getCategoriesListMessage = (categories) => {
  let message = '<b>Управление категориями:</b>\n\n';
  
  if (categories.length === 0) {
    message += 'Категории отсутствуют.';
  } else {
    categories.forEach((cat, idx) => {
      message += `${idx + 1}. ${cat.name} (ID: ${cat.id})\n`;
    });
  }
  
  return message;
};

const getCategoryDetailsMessage = (category) => {
  let message = `<b>📂 Категория:</b> ${category.name}\n`;
  message += `<b>ID:</b> ${category.id}\n`;
  if (category.description) {
    message += `<b>Описание:</b> ${category.description}\n`;
  }
  if (category.image) {
    message += `<b>Изображение:</b> [есть]\n`;
  }
  message += `\n<b>Товаров:</b> ${category.products?.length || 0}`;
  
  return message;
};

const getCategoryEditMessage = (categoryName) => {
  return `<b>✏️ Редактирование категории:</b> ${categoryName}

Выберите, что хотите изменить:`;
};

const getCategoryDeleteConfirmMessage = (categoryName, categoryId) => {
  return `⚠️ <b>Подтверждение удаления</b>

Вы действительно хотите удалить категорию <b>"${categoryName}"</b> (ID: ${categoryId})?

<i>Это действие нельзя отменить!</i>`;
};

const getCategoryDeleteWithProductsMessage = (categoryName, categoryId, productsCount) => {
  return `⚠️ <b>Внимание! Категория содержит товары</b>

Категория <b>"${categoryName}"</b> (ID: ${categoryId}) содержит <b>${productsCount} товаров</b>.

Выберите действие:
• Удалить категорию вместе со всеми товарами
• Отменить операцию

<i>Удаление товаров нельзя отменить!</i>`;
};

const getCategoryCreatedMessage = (categoryName, categoryId) => {
  return `✅ Категория "${categoryName}" (ID: ${categoryId}) успешно создана!`;
};

const getCategoryDeletedMessage = (categoryName, categoryId) => {
  return `✅ Категория "${categoryName}" (ID: ${categoryId}) успешно удалена!`;
};

// Сообщения товаров
const getProductsInCategoryMessage = (categoryName, products, currentPage, totalPages) => {
  let message = `<b>Товары в категории "${categoryName}":</b>\n`;
  message += `📦 Всего товаров: ${products.length}\n`;
  
  if (totalPages > 1) {
    message += `📄 Страница ${currentPage + 1} из ${totalPages}\n`;
  }
  message += '\n';
  
  return message;
};

const getProductListItemMessage = (product, index) => {
  return `${index}. ${product.name} - ${formatPrice(product.price)} (${product.productId})`;
};

const getProductDetailsMessage = (product) => {
  const specsText = formatSpecsForDisplay(product.specs);
  
  // Парсим дополнительные изображения
  let additionalImagesText = 'Нет';
  if (product.allImages) {
    try {
      const images = JSON.parse(product.allImages);
      additionalImagesText = `${images.length} изображения`;
    } catch (e) {
      additionalImagesText = 'Ошибка формата';
    }
  }

  return `<b>📋 Детальная информация о товаре</b>

🆔 <b>ProductId:</b> ${product.productId}
📦 <b>Название:</b> ${product.name}
💰 <b>Цена:</b> ${formatPrice(product.price)}
📝 <b>Описание:</b> ${product.description || 'Не указано'}

<b>🔧 Характеристики:</b>
${specsText}

<b>🖼 Изображения:</b>
• Основное: ${product.image ? 'Есть' : 'Нет'}
• FPS изображение: ${product.fpsImage ? 'Есть' : 'Нет'}
• Дополнительные: ${additionalImagesText}

<b>🎬 Видео:</b> ${product.videoUrl ? `<a href="${product.videoUrl}">Ссылка</a>` : 'Нет'}
<b>🎬 Видеообзор тестов FPS:</b> ${product.fpsVideoUrl ? `<a href="${product.fpsVideoUrl}">Ссылка</a>` : 'Нет'}

⭐ <b>Ранг избранного:</b> ${product.favoriteRank || 0}
📅 <b>Создан:</b> ${formatDate(product.createdAt)}
📅 <b>Обновлен:</b> ${formatDate(product.updatedAt)}`;
};

const getProductEditMessage = (productName) => {
  return `<b>✏️ Редактирование товара:</b> ${productName}

Выберите, что хотите изменить:`;
};

const getProductDeleteConfirmMessage = (productName, productStringId) => {
  return `⚠️ <b>Подтверждение удаления</b>

Вы действительно хотите удалить товар:
<b>"${productName}"</b> (${productStringId})?

<i>Это действие нельзя отменить!</i>`;
};

const getProductDeletedMessage = (productName, productStringId) => {
  return `✅ Товар "${productName}" (${productStringId}) успешно удален!`;
};

const getProductSearchResultsMessage = (categoryName, searchQuery, foundProducts, totalProducts) => {
  let message = `<b>Результаты поиска в категории "${categoryName}":</b>\n`;
  message += `🔍 Запрос: "${searchQuery}"\n`;
  message += `📦 Найдено: ${foundProducts.length} из ${totalProducts}\n\n`;
  
  if (foundProducts.length === 0) {
    message += 'Товары не найдены.\n\nПопробуйте изменить поисковый запрос.';
  }
  
  return message;
};

// Alias for backward compatibility
const getSearchResultsMessage = getProductSearchResultsMessage;

// Сообщения для FSM (создание/редактирование)
const getInputPrompts = {
  categoryName: 'Введите название новой категории:\n\n💡 Для отмены введите /cancel',
  categoryDescription: 'Введите описание категории (или "-" для пропуска):\n\n💡 Для отмены введите /cancel',
  categoryImage: 'Отправьте изображение категории (или "-" для пропуска):\n\n💡 Для отмены введите /cancel',
  
  productId: (categoryId) => `Введите уникальный строковый идентификатор товара (productId) для связи с сайтом:\n\nПримеры: PC-FHD-001, MON-ASUS-001, KB-LOGI-001\n\nВажно: от 3 до 20 символов, только буквы, цифры и дефисы!\n\n💡 Для отмены создания товара введите /cancel`,
  productName: 'Введите название товара:\n\n💡 Для отмены введите /cancel',
  productPrice: 'Введите цену товара (только число, например: 99990):\n\n💡 Для отмены введите /cancel',
  productDescription: 'Введите полное описание товара (или "-" для пропуска):\n\n💡 Для отмены введите /cancel',
  productSpecs: `Введите характеристики товара (каждая с новой строки).

Пример для ПК:
Процессор: Intel i7-12700F
Видеокарта: RTX 4070
RAM: 16GB DDR4
SSD: 1TB NVMe

Пример для девайса:
Тип: Игровая мышь
DPI: 16000
Подключение: USB
Вес: 85г

Или "-" для пропуска:

💡 Для отмены введите /cancel`,
  productMainImage: 'Отправьте основное изображение товара:\n\n📸 Фото (со сжатием) или 📎 Файл (без сжатия)\n\nИли "-" для пропуска:\n\n💡 Для отмены введите /cancel',
  productFpsImage: 'Отправьте изображение с FPS тестами:\n\n📸 Фото (со сжатием) или 📎 Файл (без сжатия)\n\nИли "-" для пропуска:\n\n💡 Для отмены введите /cancel',
  productAllImages: `Отправляйте дополнительные изображения товара:

• 🖼️ По одному (фото или файлы)
• 📚 Альбомом до 10 изображений сразу

Когда закончите, напишите "готово" или "-" для пропуска:

💡 Для отмены введите /cancel`,
  productRank: `Введите ранг товара для "лучших предложений" (0-100, где 0 = обычный товар, 100 = топ предложение):

Или "-" для установки 0:

💡 Для отмены введите /cancel`,
  
  searchQuery: 'Введите название товара для поиска:\n\n💡 Будет найдены товары, содержащие ваш запрос в названии\n💡 Для отмены введите /cancel',
  
  // Редактирование полей
  editProductId: 'Введите новый уникальный строковый идентификатор товара (productId) для связи с сайтом:\n\nПримеры: PC-FHD-001, MON-ASUS-001, KB-LOGI-001\n\nВажно: от 3 до 20 символов, только буквы, цифры и дефисы!\n\n💡 Для отмены введите /cancel',
  editProductName: 'Введите новое название товара:\n\n💡 Для отмены введите /cancel',
  editProductPrice: 'Введите новую цену товара (только число):\n\nПример: 150000\n\n💡 Для отмены введите /cancel',
  editProductDescription: 'Введите новое описание товара:\n\n💡 Для отмены введите /cancel',
  editProductSpecs: 'Введите новые характеристики в формате:\nКлюч: Значение\nКлюч: Значение\n\nПример:\nПроцессор: Intel i7-12700F\nВидеокарта: RTX 4070\nRAM: 16GB DDR4\n\n💡 Для отмены введите /cancel',
  editProductMainImage: 'Отправьте новое основное изображение товара:\n\n📸 Фото (со сжатием) или 📎 Файл (без сжатия)\n\n💡 Для отмены введите /cancel',
  editProductFpsImage: 'Отправьте новое FPS изображение товара:\n\n📸 Фото (со сжатием) или 📎 Файл (без сжатия)\nИли "-" для удаления\n\n💡 Для отмены введите /cancel',
  editProductAllImages: 'Отправьте новые дополнительные изображения:\n\n📸 Можете отправлять по одному или альбомом\n\nКогда закончите, напишите "готово"\nДля удаления всех доп. изображений напишите "удалить"\n\n💡 Для отмены введите /cancel',
  productVideoUrl: 'Отправьте ссылку на видео (http/https) или "-" для пропуска:\n\nПримеры: https://youtu.be/..., https://www.youtube.com/watch?v=...\n\n💡 Для отмены введите /cancel',
  editProductVideoUrl: 'Отправьте новую ссылку на видео (http/https) или "-" для удаления:\n\n💡 Для отмены введите /cancel',
  productFpsVideoUrl: 'Отправьте ссылку на "Видеообзор тестов FPS" (http/https) или "-" для пропуска:\n\nПримеры: https://youtu.be/..., https://www.youtube.com/watch?v=...\n\n💡 Для отмены введите /cancel',
  editProductFpsVideoUrl: 'Отправьте новую ссылку на "Видеообзор тестов FPS" (http/https) или "-" для удаления:\n\n💡 Для отмены введите /cancel',
  editProductRank: 'Введите новый ранг избранного (число от 0 до 100):\n\n0 - не избранное\n1-100 - уровень приоритета\n\n💡 Для отмены введите /cancel',
};

// Сообщения об ошибках
const getErrorMessages = {
  categoryNameLength: 'Название категории должно быть от 2 до 50 символов. Попробуйте еще раз:',
  productNameLength: 'Название товара должно быть от 2 до 100 символов. Попробуйте еще раз:\n\n💡 Для отмены введите /cancel',
  invalidPrice: 'Некорректная цена. Введите положительное число (например: 99990):\n\n💡 Для отмены введите /cancel',
  invalidProductId: '❌ ProductId должен быть от 3 до 20 символов и содержать только буквы, цифры и дефисы. Попробуйте еще раз:\n\n💡 Для отмены введите /cancel',
  invalidFavoriteRank: '❌ Ранг должен быть числом от 0 до 100. Попробуйте еще раз или "-" для 0:\n\n💡 Для отмены введите /cancel',
  idAlreadyExists: (id) => `Товар с ID ${id} уже существует!\n\nВведите другой уникальный ID:\n\n💡 Для отмены введите /cancel`,
  searchQueryTooShort: 'Поисковый запрос не может быть пустым. Введите название товара или его ID:\n\n💡 Для отмены введите /cancel',
  searchQueryTooLong: 'Поисковый запрос слишком длинный (максимум 50 символов). Попробуйте короче:\n\n💡 Для отмены введите /cancel',
  invalidImageFormat: 'Пожалуйста, отправьте изображение (📸 фото или 📎 файл) или "-" для пропуска.\n\n💡 Для отмены введите /cancel',
  fileTooLarge: 'Изображение слишком большое (максимум 20MB).\n\nПопробуйте сжать изображение или отправить с галочкой "Сжать изображение".',
  invalidSpecs: (error) => `Некорректный формат характеристик!\n\nОшибка: ${error}\n\nПравильный формат (каждая с новой строки):\nПроцессор: Intel i7\nВидеокарта: RTX 4070\nRAM: 16GB\n\nПопробуйте еще раз или введите "-" для пропуска:\n\n💡 Для отмены введите /cancel`,
};

// Сообщения об успехе
const getSuccessMessages = {
  categoryCreated: (name, id) => `Категория "${name}" (ID: ${id}) успешно создана!`,
  categoryUpdated: (field) => `${field} категории обновлено!`,
  categoryDeleted: (name, id) => `Категория "${name}" (ID: ${id}) успешно удалена!`,
  
  productCreated: 'Товар успешно создан!',
  productUpdated: (field) => `${field} товара обновлено!`,
  productDeleted: (name, id) => `Товар "${name}" (ID: ${id}) успешно удален!`,
  
  operationCancelled: 'Операция отменена.',
  backToMainMenu: 'Вы вернулись в главное меню:',
  imageUploading: 'Загружаю изображение в хранилище...',
  imageUploaded: 'Изображение успешно загружено!',
};

module.exports = {
  getWelcomeMessage,
  getContactMessage,
  getCatalogMessage,
  getAdminPanelMessage,
  getCategoriesListMessage,
  getCategoryDetailsMessage,
  getCategoryEditMessage,
  getCategoryDeleteConfirmMessage,
  getCategoryDeleteWithProductsMessage,
  getCategoryCreatedMessage,
  getCategoryDeletedMessage,
  getProductsInCategoryMessage,
  getProductListItemMessage,
  getProductDetailsMessage,
  getProductEditMessage,
  getProductDeleteConfirmMessage,
  getProductDeletedMessage,
  getProductSearchResultsMessage,
  getSearchResultsMessage, // backward compatibility alias
  getInputPrompts,
  getErrorMessages,
  getSuccessMessages,
}; 