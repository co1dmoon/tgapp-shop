const { Markup } = require('telegraf');
const adminController = require('../../../controllers/adminController');
const { createKeyboardRows } = require('../core/utils');

// Генерация главного меню (с учетом админских прав)
const getMainMenuKeyboard = async (userId, webAppUrl) => {
  const isAdmin = await adminController.isAdmin(userId.toString());
  const buttons = [];

  const catalogButtonText = isAdmin ? 'Каталог (Web App)' : 'Открыть каталог';
  buttons.push([Markup.button.webApp(catalogButtonText, webAppUrl)]);
  buttons.push([Markup.button.callback('Связаться с нами', 'contact_us')]);

  if (isAdmin) {
    buttons.push([Markup.button.callback('Админ панель', 'admin_panel')]);
  }

  return Markup.inlineKeyboard(buttons);
};

// Клавиатура каталога для команды /catalog
const getCatalogKeyboard = (webAppUrl) => {
  return Markup.inlineKeyboard([
    [Markup.button.webApp('🛒 Открыть каталог', webAppUrl)]
  ]);
};

// Главная админская панель
const getAdminPanelKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🗂️ Категории', 'admin_categories')],
    [Markup.button.callback('🖥️ Товары', 'admin_products')],
    [Markup.button.callback('🔙 Назад в гл. меню', 'back_to_menu')],
  ]);
};

// Клавиатура управления категориями
const getCategoryManagementKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('➕ Добавить категорию', 'add_category')],
    [Markup.button.callback('🔙 Назад', 'admin_panel')],
  ]);
};

// Клавиатура для просмотра категории
const getCategoryViewKeyboard = (categoryId, categoryName) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(`✏️ Редактировать "${categoryName}"`, `edit_category_${categoryId}`),
      Markup.button.callback(`🗑 Удалить "${categoryName}"`, `delete_category_${categoryId}`)
    ],
    [Markup.button.callback('🔙 К списку категорий', 'admin_categories')]
  ]);
};

// Клавиатура редактирования категории
const getCategoryEditKeyboard = (categoryId, categoryName) => {
  return Markup.inlineKeyboard([
    [Markup.button.callback(`📝 Название "${categoryName}"`, `edit_category_name_${categoryId}`)],
    [Markup.button.callback(`📋 Описание "${categoryName}"`, `edit_category_desc_${categoryId}`)],
    [Markup.button.callback(`🖼 Изображение "${categoryName}"`, `edit_category_image_${categoryId}`)],
    [Markup.button.callback(`👁 Просмотреть "${categoryName}"`, `view_category_${categoryId}`)],
    [Markup.button.callback('🔙 К списку категорий', 'admin_categories')]
  ]);
};

// Клавиатура подтверждения удаления категории
const getCategoryDeleteKeyboard = (categoryId, categoryName) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(`✅ Да, удалить "${categoryName}"`, `confirm_delete_category_${categoryId}`),
      Markup.button.callback(`❌ Отменить удаление "${categoryName}"`, `view_category_${categoryId}`)
    ]
  ]);
};

// Клавиатура выбора категорий для товаров
const getCategorySelectorKeyboard = (categories, actionPrefix = 'products_cat', backAction = 'admin_products') => {
  const buttons = categories.map((cat) =>
    Markup.button.callback(`${cat.name}`, `${actionPrefix}_${cat.id}`)
  );
  
  const keyboardRows = createKeyboardRows(buttons, 2);
  keyboardRows.push([Markup.button.callback('🔙 Назад', backAction)]);
  
  return { reply_markup: { inline_keyboard: keyboardRows } };
};

// Клавиатура управления товарами
const getProductManagementKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('➕ Добавить товар', 'add_product')],
    [Markup.button.callback('🔙 Назад', 'admin_panel')],
  ]);
};

// Клавиатура для отображения товаров с пагинацией
const getProductListKeyboard = (products, categoryId, currentPage, totalPages, hasSearch = false) => {
  const keyboardRows = [];
  
  // Кнопки для каждого товара на странице
  products.forEach((product, index) => {
    const globalIndex = currentPage * 5 + index + 1; // 5 товаров на страницу
    const productInfo = `${product.name} (${product.productId})`;
    keyboardRows.push([
      Markup.button.callback(`👁 ${productInfo}`, `view_product_${product.id}`),
      Markup.button.callback(`✏️ ${productInfo}`, `edit_product_${product.id}`)
    ]);
  });
  
  // Навигация по страницам
  if (totalPages > 1) {
    const navButtons = [];
    
    if (currentPage > 0) {
      navButtons.push(
        Markup.button.callback('⬅️ Пред.', `products_page_${categoryId}_${currentPage - 1}`)
      );
    }
    
    navButtons.push(
      Markup.button.callback(`${currentPage + 1}/${totalPages}`, 'noop')
    );
    
    if (currentPage < totalPages - 1) {
      navButtons.push(
        Markup.button.callback('След. ➡️', `products_page_${categoryId}_${currentPage + 1}`)
      );
    }
    
    keyboardRows.push(navButtons);
  }
  
  // Общие кнопки
  keyboardRows.push([
    Markup.button.callback('➕ Добавить товар сюда', `add_product_to_${categoryId}`)
  ]);
  
  if (hasSearch) {
    keyboardRows.push([
      Markup.button.callback('🔍 Найти товар', `search_product_${categoryId}`)
    ]);
  }
  
  keyboardRows.push([
    Markup.button.callback('🔙 К категориям', 'admin_products')
  ]);
  
  return { reply_markup: { inline_keyboard: keyboardRows } };
};

// Клавиатура для результатов поиска товаров
const getProductSearchResultsKeyboard = (products, categoryId, hasMoreResults = false, moreCount = 0) => {
  const keyboardRows = [];
  
  products.forEach((product, index) => {
    const productInfo = `${product.name} (${product.productId})`;
    keyboardRows.push([
      Markup.button.callback(`👁 ${productInfo}`, `view_product_${product.id}`),
      Markup.button.callback(`✏️ ${productInfo}`, `edit_product_${product.id}`)
    ]);
  });
  
  // Добавляем информацию о дополнительных результатах, если есть
  if (hasMoreResults && moreCount > 0) {
    keyboardRows.push([
      Markup.button.callback(`📄 Показать еще ${moreCount} товаров`, 'noop')
    ]);
  }
  
  keyboardRows.push([
    Markup.button.callback('🔍 Новый поиск', `search_product_${categoryId}`),
    Markup.button.callback('📋 Все товары', `products_cat_${categoryId}`)
  ]);
  keyboardRows.push([
    Markup.button.callback('🔙 К категориям', 'admin_products')
  ]);
  
  return { reply_markup: { inline_keyboard: keyboardRows } };
};

// Клавиатура просмотра товара
const getProductViewKeyboard = (productId, categoryId, productName, productStringId) => {
  const productInfo = `${productName} (${productStringId})`;
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(`✏️ Редактировать "${productInfo}"`, `edit_product_${productId}`),
      Markup.button.callback(`🗑 Удалить "${productInfo}"`, `delete_product_${productId}`)
    ],
    [
      Markup.button.callback('📋 К товарам', `products_cat_${categoryId}`),
      Markup.button.callback('🔍 Поиск', `search_product_${categoryId}`)
    ]
  ]);
};

// Клавиатура редактирования товара
const getProductEditKeyboard = (productId, categoryId, productName, productStringId) => {
  const productInfo = `${productName} (${productStringId})`;
  return Markup.inlineKeyboard([
    [Markup.button.callback(`🆔 ProductId "${productInfo}"`, `edit_product_id_${productId}`)],
    [Markup.button.callback(`📝 Название "${productInfo}"`, `edit_product_name_${productId}`)],
    [Markup.button.callback(`💰 Цена "${productInfo}"`, `edit_product_price_${productId}`)],
    [Markup.button.callback(`📋 Описание "${productInfo}"`, `edit_product_description_${productId}`)],
    [Markup.button.callback(`🔧 Характеристики "${productInfo}"`, `edit_product_specs_${productId}`)],
    [Markup.button.callback(`🖼 Основное изображение "${productInfo}"`, `edit_product_image_${productId}`)],
    [Markup.button.callback(`🎮 FPS изображение "${productInfo}"`, `edit_product_fps_image_${productId}`)],
    [Markup.button.callback(`📸 Доп. изображения "${productInfo}"`, `edit_product_all_images_${productId}`)],
    [Markup.button.callback(`⭐ Ранг избранного "${productInfo}"`, `edit_product_rank_${productId}`)],
    [Markup.button.callback(`👁 Просмотреть "${productInfo}"`, `view_product_${productId}`)],
    [
      Markup.button.callback('📋 К товарам', `products_cat_${categoryId}`),
      Markup.button.callback('🔍 Поиск', `search_product_${categoryId}`)
    ]
  ]);
};

// Клавиатура подтверждения удаления товара
const getProductDeleteKeyboard = (productId, productName, productStringId) => {
  const productInfo = `${productName} (${productStringId})`;
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(`✅ Да, удалить "${productInfo}"`, `confirm_delete_product_${productId}`),
      Markup.button.callback(`❌ Отменить удаление "${productInfo}"`, `view_product_${productId}`)
    ]
  ]);
};

// Клавиатура "Назад к товарам категории"
const getBackToCategoryKeyboard = (categoryId) => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔙 К товарам категории', `products_cat_${categoryId}`)]
  ]);
};

// Клавиатура "Назад к списку категорий"
const getBackToCategoriesKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔙 К списку категорий', 'admin_categories')]
  ]);
};

// Клавиатура выбора категории для товаров
const getCategorySelectionKeyboard = (categories, isEmpty = false, showAddProduct = false, isForNewProduct = false) => {
  const keyboardRows = [];
  
  if (isEmpty) {
    keyboardRows.push([
      Markup.button.callback('➕ Добавить категорию', 'add_category'),
      Markup.button.callback('🔙 Назад', 'admin_panel')
    ]);
  } else {
    // Кнопки категорий
    const buttons = categories.map((cat) => {
      const action = isForNewProduct ? `add_product_to_${cat.id}` : `products_cat_${cat.id}`;
      return Markup.button.callback(`${cat.name}`, action);
    });
    
    const categoryRows = createKeyboardRows(buttons, 2);
    keyboardRows.push(...categoryRows);
    
    if (showAddProduct && !isForNewProduct) {
      keyboardRows.push([
        Markup.button.callback('➕ Добавить товар', 'add_product')
      ]);
    }
    
    keyboardRows.push([
      Markup.button.callback('🔙 Назад', 'admin_panel')
    ]);
  }
  
  return { reply_markup: { inline_keyboard: keyboardRows } };
};

// Клавиатура "Назад к товарам"
const getBackToProductsKeyboard = (categoryId) => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔙 К товарам категории', `products_cat_${categoryId}`)]
  ]);
};

module.exports = {
  getMainMenuKeyboard,
  getCatalogKeyboard,
  getAdminPanelKeyboard,
  getCategoryManagementKeyboard,
  getCategoryViewKeyboard,
  getCategoryEditKeyboard,
  getCategoryDeleteKeyboard,
  getCategorySelectorKeyboard,
  getCategorySelectionKeyboard,
  getProductManagementKeyboard,
  getProductListKeyboard,
  getProductSearchResultsKeyboard,
  getProductViewKeyboard,
  getProductEditKeyboard,
  getProductDeleteKeyboard,
  getBackToCategoryKeyboard,
  getBackToCategoriesKeyboard,
  getBackToProductsKeyboard,
}; 