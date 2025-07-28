const { Telegraf, Markup, message } = require('telegraf');
require('dotenv').config(); // Убедимся, что dotenv загружен

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
// const orderController = require('../controllers/orderController'); // Удален - заказы не нужны
const adminController = require('../controllers/adminController');
// const userController = require('../controllers/userController'); // Удален - пользователи не нужны
const s3Service = require('./s3Service');

// Получаем URL веб-приложения из переменных окружения
// const webAppUrl = process.env.WEBAPP_URL;
// if (!webAppUrl) {
//   console.error('Ошибка: Переменная окружения WEBAPP_URL не установлена!');
// Можно установить URL по умолчанию для локальной разработки, если нужно
// webAppUrl = 'http://localhost:3001/catalog.html';

// Получаем токен бота
const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  console.error('Ошибка: Переменная окружения BOT_TOKEN не установлена!');
  process.exit(1); // Критическая ошибка, выходим
}
const bot = new Telegraf(botToken);

// Проверяем конфигурацию S3
if (!s3Service.isConfigured()) {
  console.warn('⚠️ S3 хранилище не настроено!');
  console.warn('Для загрузки изображений в VK Cloud S3 добавьте в .env:');
  console.warn('VK_S3_ACCESS_KEY_ID=your_access_key');
  console.warn('VK_S3_SECRET_ACCESS_KEY=your_secret_key');
  console.warn('VK_S3_BUCKET_NAME=your_bucket_name');
  console.warn('VK_S3_ENDPOINT=https://hb.bizmrg.com');
  console.warn('VK_S3_REGION=ru-msk');
  console.warn('Бот будет работать, но изображения будут сохраняться как file_id');
} else {
  console.log('✅ S3 хранилище настроено и готово к работе');
}

// Состояния пользователей для FSM (Finite State Machine) - если используется для админки
const userStates = {};
const setState = (userId, state) => {
  userStates[userId] = state;
};
const getState = (userId) => userStates[userId] || null;

// Проверка прав администратора
const checkAdmin = async (ctx, next) => {
  const userId = ctx.from.id.toString();
  const isUserAdmin = await adminController.isAdmin(userId);
  if (!isUserAdmin) {
    return ctx.reply('Доступ запрещен. У вас нет прав администратора.');
  }
  return next();
};

// Генерация главного меню (с учетом админских прав)
const getMainMenuKeyboard = async (userId, webAppUrl) => {
  const isAdmin = await adminController.isAdmin(userId.toString());
  const buttons = [];

  const catalogButtonText = isAdmin ? 'Каталог (Web App)' : 'Открыть каталог';
  buttons.push([Markup.button.webApp(catalogButtonText, webAppUrl)]); // Используем webAppUrl
  // buttons.push([Markup.button.callback('Мои заказы', 'my_orders')]); // Удалено - заказы не нужны
  buttons.push([Markup.button.callback('Связаться с нами', 'contact_us')]);

  if (isAdmin) {
    buttons.push([Markup.button.callback('Админ панель', 'admin_panel')]);
  }

  return Markup.inlineKeyboard(buttons);
};

// Инициализация бота
const initBot = async (webAppUrl) => {
  try {
    console.log('[INIT] Инициализация бота...');
    await adminController.initAdminsFromEnv();
    console.log('[INIT] Администраторы инициализированы.');

    // --- Обработчики команд и действий ---

    // /start
    bot.start(async (ctx) => {
      const userId = ctx.from.id.toString();
      const userName = ctx.from.first_name || 'Пользователь';

      // Показываем главное меню (без проверки пользователей)
      try {
        const keyboard = await getMainMenuKeyboard(userId, webAppUrl);
        return ctx.reply(
          `👋 Привет, ${userName}! Добро пожаловать в b.ZONE pc. Выберите действие:`,
          keyboard
        );
      } catch (error) {
        console.error('Ошибка при показе главного меню:', error);
        const keyboard = await getMainMenuKeyboard(userId, webAppUrl);
        return ctx.reply(
          `👋 Привет, ${userName}! Добро пожаловать в b.ZONE pc. Выберите действие:`,
          keyboard
        );
      }
    });

    // /catalog (альтернативный способ открыть каталог)
    bot.command('catalog', async (ctx) => {
      return ctx.reply(
        'Нажмите кнопку ниже, чтобы открыть каталог:',
        Markup.inlineKeyboard([
          [Markup.button.webApp('🛒 Открыть каталог', webAppUrl)], // Используем webAppUrl
        ])
      );
    });

    // /cancel (отмена создания товара для админов)
    bot.command('cancel', checkAdmin, async (ctx) => {
      const userId = ctx.from.id;
      const state = getState(userId);
      
      if (state) {
        setState(userId, null); // Сбрасываем состояние
        await ctx.reply('❌ Создание товара отменено.');
        
        // Возвращаемся в админ панель
        setTimeout(async () => {
          try {
            const keyboard = await getMainMenuKeyboard(userId, webAppUrl);
            await ctx.reply('Вы вернулись в главное меню:', keyboard);
          } catch (error) {
            console.error('Ошибка при возвращении в главное меню:', error);
          }
        }, 500);
      } else {
        await ctx.reply('Нет активного процесса создания товара для отмены.');
      }
    });

    // Обработчик кнопки 'Связаться с нами'
    bot.action('contact_us', async (ctx) => {
      await ctx.answerCbQuery();
      const keyboard = await getMainMenuKeyboard(ctx.from.id, webAppUrl);
      // Замените на актуальные контакты
      const contactMessage =
        '<b>Свяжитесь с нами:</b>\n\n' +
        '📱 Телефон: <a href="tel:+7XXXXXXXXXX">+7 (XXX) XXX-XX-XX</a>\n' +
        '📧 Email: <a href="mailto:support@bzone.pc">support@bzone.pc</a>\n' +
        '💬 Telegram: <a href="https://t.me/your_support_contact">@your_support_contact</a>\n' +
        '🌐 Сайт: <a href="https://bzone.pc">bzone.pc</a>';
      return ctx.editMessageText(contactMessage, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    });

    // Кнопка Назад в главное меню (из админ панели)
    bot.action('back_to_menu', async (ctx) => {
      await ctx.answerCbQuery();
      const keyboard = await getMainMenuKeyboard(ctx.from.id, webAppUrl);
      return ctx.editMessageText('Главное меню:', keyboard);
    });

    // --- Админские команды и действия ---

    // Вход в админ панель (/admin или кнопка)
    const showAdminPanel = async (ctx) => {
      return ctx.reply('<b>Панель администратора:</b>', {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('🗂️ Категории', 'admin_categories')],
          [Markup.button.callback('🖥️ Товары', 'admin_products')],
          // [Markup.button.callback('📦 Заказы', 'admin_orders')], // УДАЛЕНО - заказы не нужны
          // [Markup.button.callback('👥 Администраторы', 'admin_users')], // Если нужно управление админами
          [Markup.button.callback('🔙 Назад в гл. меню', 'back_to_menu')],
        ]).reply_markup,
      });
    };
    bot.command('admin', checkAdmin, showAdminPanel);
    bot.action('admin_panel', checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.deleteMessage(); // Удаляем предыдущее сообщение меню
      await showAdminPanel(ctx);
    });

    // Функция для показа списка категорий
    async function showCategoriesList(ctx, useEdit = true) {
      const categories = await categoryController.getAllCategories();
      let message = '<b>Управление категориями:</b>\n\n';
      const keyboardRows = [];
      if (categories.length === 0) {
        message += 'Категории отсутствуют.';
      } else {
        categories.forEach((cat, idx) => {
          message += `${idx + 1}. ${cat.name} (ID: ${cat.id})\n`;
          keyboardRows.push([
            Markup.button.callback(`👁 Просмотреть "${cat.name}"`, `view_category_${cat.id}`),
            Markup.button.callback(`✏️ Редактировать "${cat.name}"`, `edit_category_${cat.id}`)
          ]);
        });
      }
      keyboardRows.push([
        Markup.button.callback('➕ Добавить категорию', 'add_category')
      ]);
      keyboardRows.push([
        Markup.button.callback('🔙 Назад', 'admin_panel')
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
    }

    // --- Управление Категориями (расширенное) ---
    bot.action('admin_categories', checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      await showCategoriesList(ctx, true);
    });

    // FSM: создание категории (шаг 1)
    bot.action('add_category', checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      setState(ctx.from.id, 'wait_new_category_name');
      await ctx.reply('📝 Введите название новой категории:\n\n💡 Для отмены введите /cancel');
    });

    // FSM: просмотр категории
    bot.action(/^view_category_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const catId = parseInt(ctx.match[1]);
      try {
        const cat = await categoryController.getCategoryById(catId);
        if (!cat) {
          return ctx.editMessageText('Категория не найдена.', {
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('🔙 Назад', 'admin_categories')]
            ]).reply_markup,
          });
        }
        let message = `<b>📂 Категория:</b> ${cat.name}\n`;
        message += `<b>ID:</b> ${cat.id}\n`;
        if (cat.description) message += `<b>Описание:</b> ${cat.description}\n`;
        if (cat.image) message += `<b>Изображение:</b> [есть]\n`;
        message += `\n<b>Товаров:</b> ${cat.products.length}`;
      await ctx.editMessageText(message, {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('✏️ Редактировать', `edit_category_${cat.id}`), Markup.button.callback('🗑 Удалить', `delete_category_${cat.id}`)],
            [Markup.button.callback('🔙 К списку категорий', 'admin_categories')]
        ]).reply_markup,
      });
      } catch (error) {
        await ctx.reply('Ошибка при просмотре категории.');
      }
    });

    // FSM: редактирование категории (главное меню)
    bot.action(/^edit_category_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const catId = parseInt(ctx.match[1]);
      try {
        const cat = await categoryController.getCategoryById(catId);
        if (!cat) return ctx.editMessageText('Категория не найдена.');
        const message = `<b>✏️ Редактирование категории:</b> ${cat.name}\n\nВыберите, что хотите изменить:`;
        await ctx.editMessageText(message, {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('📝 Название', `edit_category_name_${catId}`)],
            [Markup.button.callback('📋 Описание', `edit_category_desc_${catId}`)],
            [Markup.button.callback('🖼 Изображение', `edit_category_image_${catId}`)],
            [Markup.button.callback('👁 Просмотреть', `view_category_${catId}`)],
            [Markup.button.callback('🔙 К списку категорий', 'admin_categories')]
          ]).reply_markup,
        });
      } catch (error) {
        await ctx.reply('Ошибка при редактировании категории.');
      }
    });

    // FSM: удаление категории (подтверждение)
    bot.action(/^delete_category_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const catId = parseInt(ctx.match[1]);
      try {
        const cat = await categoryController.getCategoryById(catId);
        if (!cat) return ctx.editMessageText('Категория не найдена.');
        await ctx.editMessageText(
          `⚠️ <b>Подтверждение удаления</b>\n\nВы действительно хотите удалить категорию <b>"${cat.name}"</b> (ID: ${catId})?\n\n<i>Это действие нельзя отменить!</i>`,
          {
            parse_mode: 'HTML',
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('✅ Да, удалить', `confirm_delete_category_${catId}`), Markup.button.callback('❌ Отменить', `view_category_${catId}`)]
            ]).reply_markup,
          }
        );
      } catch (error) {
        await ctx.reply('Ошибка при удалении категории.');
      }
    });

    // FSM: подтверждение удаления категории
    bot.action(/^confirm_delete_category_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const catId = parseInt(ctx.match[1]);
      try {
        const cat = await categoryController.getCategoryById(catId);
        if (!cat) return ctx.editMessageText('Категория не найдена.');
        await categoryController.deleteCategory(catId);
        await ctx.editMessageText(`✅ Категория "${cat.name}" (ID: ${catId}) успешно удалена!`, {
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('🔙 К списку категорий', 'admin_categories')]
          ]).reply_markup,
        });
      } catch (error) {
        await ctx.reply('Ошибка при удалении категории.');
      }
    });

    // --- Управление Товарами ---
    bot.action('admin_products', checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const categories = await categoryController.getAllCategories();
      if (categories.length === 0) {
        return ctx.editMessageText('Сначала добавьте категории.', {
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('➕ Добавить категорию', 'add_category')],
            [Markup.button.callback('🔙 Назад', 'admin_panel')],
          ]).reply_markup,
        });
      }
      const buttons = categories.map((cat) =>
        Markup.button.callback(`${cat.name}`, `products_cat_${cat.id}`)
      );
      // Разбиваем кнопки по 2 в ряд для лучшего вида
      const keyboardRows = [];
      for (let i = 0; i < buttons.length; i += 2) {
        keyboardRows.push(buttons.slice(i, i + 2));
      }
      keyboardRows.push([
        Markup.button.callback('➕ Добавить товар', 'add_product'),
      ]);
      keyboardRows.push([Markup.button.callback('🔙 Назад', 'admin_panel')]);

      await ctx.editMessageText(
        'Выберите категорию для просмотра/добавления товаров:',
        {
          reply_markup: { inline_keyboard: keyboardRows },
        }
      );
    });

    // Действие при выборе категории для просмотра товаров (первая страница)
    bot.action(/^products_cat_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const catId = parseInt(ctx.match[1]);
      // Показываем первую страницу (страницы начинаются с 0)
      await showProductsPage(ctx, catId, 0);
    });

    // Действие для навигации по страницам товаров
    bot.action(/^products_page_(\d+)_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const catId = parseInt(ctx.match[1]);
      const page = parseInt(ctx.match[2]);
      await showProductsPage(ctx, catId, page);
    });

    // Функция отображения товаров с пагинацией
    async function showProductsPage(ctx, catId, page = 0) {
      try {
        const products = await productController.getProductsByCategory(catId);
        const category = await categoryController.getCategoryById(catId);
        
        const ITEMS_PER_PAGE = 5; // Показываем по 5 товаров на странице
        const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
        const currentPage = Math.max(0, Math.min(page, totalPages - 1));
        
        // Получаем товары для текущей страницы
        const startIndex = currentPage * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageProducts = products.slice(startIndex, endIndex);
        
        let message = `<b>Товары в категории "${category.name}":</b>\n`;
        message += `📦 Всего товаров: ${products.length}\n`;
        if (totalPages > 1) {
          message += `📄 Страница ${currentPage + 1} из ${totalPages}\n`;
        }
        message += '\n';
        
        const keyboardRows = [];
        
        if (products.length === 0) {
          message += 'Товары отсутствуют.';
        } else {
          pageProducts.forEach((p, index) => {
            const globalIndex = startIndex + index + 1;
            message += `${globalIndex}. ${p.name} - ${p.price.toLocaleString('ru-RU')} ₽ (ID: ${p.id})\n`;
            
            // Добавляем кнопки для каждого товара на странице
            keyboardRows.push([
              Markup.button.callback(`👁 Просмотреть "${p.name}"`, `view_product_${p.id}`),
              Markup.button.callback(`✏️ Редактировать "${p.name}"`, `edit_product_${p.id}`)
            ]);
          });
          
          // Добавляем навигацию по страницам, если товаров больше чем помещается на одной странице
          if (totalPages > 1) {
            const navButtons = [];
            
            // Кнопка "Предыдущая страница"
            if (currentPage > 0) {
              navButtons.push(
                Markup.button.callback('⬅️ Пред.', `products_page_${catId}_${currentPage - 1}`)
              );
            }
            
            // Информация о странице
            navButtons.push(
              Markup.button.callback(`${currentPage + 1}/${totalPages}`, 'noop')
            );
            
            // Кнопка "Следующая страница"
            if (currentPage < totalPages - 1) {
              navButtons.push(
                Markup.button.callback('След. ➡️', `products_page_${catId}_${currentPage + 1}`)
              );
            }
            
            keyboardRows.push(navButtons);
          }
        }
        
        // Добавляем общие кнопки
        keyboardRows.push([
          Markup.button.callback('➕ Добавить товар сюда', `add_product_to_${catId}`)
        ]);
        
        // Если товаров много, добавляем кнопку поиска
        if (products.length > 10) {
          keyboardRows.push([
            Markup.button.callback('🔍 Найти товар', `search_product_${catId}`)
          ]);
        }
        
        keyboardRows.push([
          Markup.button.callback('🔙 К категориям', 'admin_products')
        ]);
        
        await ctx.editMessageText(message, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: keyboardRows },
        });
      } catch (error) {
        console.error(
          `Ошибка при получении товаров категории ${catId}:`,
          error
        );
        await ctx.editMessageText('Произошла ошибка при получении товаров.');
      }
    }

    // Обработчик для неактивных кнопок (например, индикатор страницы)
    bot.action('noop', async (ctx) => {
      await ctx.answerCbQuery();
    });

    // Поиск товаров в категории
    bot.action(/^search_product_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const catId = parseInt(ctx.match[1]);
      setState(ctx.from.id, `search_in_category_${catId}`);
      await ctx.reply(
        '🔍 Введите название товара для поиска:\n\n💡 Будет найдены товары, содержащие ваш запрос в названии\n💡 Для отмены введите /cancel'
      );
    });

    // Функция поиска и отображения найденных товаров
    async function showSearchResults(ctx, catId, searchQuery) {
      try {
        const allProducts = await productController.getProductsByCategory(catId);
        const category = await categoryController.getCategoryById(catId);
        
        // Фильтруем товары по поисковому запросу (регистронезависимо)
        const foundProducts = allProducts.filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.id.toString().includes(searchQuery)
        );
        
        let message = `<b>Результаты поиска в категории "${category.name}":</b>\n`;
        message += `🔍 Запрос: "${searchQuery}"\n`;
        message += `📦 Найдено: ${foundProducts.length} из ${allProducts.length}\n\n`;
        
        const keyboardRows = [];
        
        if (foundProducts.length === 0) {
          message += 'Товары не найдены.\n\nПопробуйте изменить поисковый запрос.';
        } else {
          // Ограничиваем до 8 результатов для удобства
          const displayProducts = foundProducts.slice(0, 8);
          
          displayProducts.forEach((p, index) => {
            message += `${index + 1}. ${p.name} - ${p.price.toLocaleString('ru-RU')} ₽ (ID: ${p.id})\n`;
            
            // Добавляем кнопки для каждого найденного товара
            keyboardRows.push([
              Markup.button.callback(`👁 Просмотреть "${p.name}"`, `view_product_${p.id}`),
              Markup.button.callback(`✏️ Редактировать "${p.name}"`, `edit_product_${p.id}`)
            ]);
          });
          
          if (foundProducts.length > 8) {
            message += `\n... и еще ${foundProducts.length - 8} товаров`;
            keyboardRows.push([
              Markup.button.callback('🔍 Уточнить поиск', `search_product_${catId}`)
            ]);
          }
        }
        
        // Добавляем общие кнопки
        keyboardRows.push([
          Markup.button.callback('🔍 Новый поиск', `search_product_${catId}`),
          Markup.button.callback('📋 Все товары', `products_cat_${catId}`)
        ]);
        keyboardRows.push([
          Markup.button.callback('🔙 К категориям', 'admin_products')
        ]);
        
        await ctx.reply(message, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: keyboardRows },
        });
      } catch (error) {
        console.error('Ошибка при поиске товаров:', error);
        await ctx.reply('❌ Произошла ошибка при поиске товаров.');
      }
    }

    // Начало добавления нового товара (выбор категории)
    bot.action('add_product', checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const categories = await categoryController.getAllCategories();
      if (categories.length === 0) {
        return ctx.editMessageText('Сначала добавьте категории.', {
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('➕ Добавить категорию', 'add_category')],
            [Markup.button.callback('🔙 Назад', 'admin_products')],
          ]).reply_markup,
        });
      }
      const buttons = categories.map((cat) =>
        Markup.button.callback(`${cat.name}`, `add_product_to_${cat.id}`)
      );
      const keyboardRows = [];
      for (let i = 0; i < buttons.length; i += 2) {
        keyboardRows.push(buttons.slice(i, i + 2));
      }
      keyboardRows.push([Markup.button.callback('🔙 Назад', 'admin_products')]);
      await ctx.editMessageText('Выберите категорию для нового товара:', {
        reply_markup: { inline_keyboard: keyboardRows },
      });
    });

    // Шаг 1 добавления товара: запрос ID
    bot.action(/^add_product_to_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const catId = parseInt(ctx.match[1]);
      setState(ctx.from.id, `wait_product_id_${catId}`);
      await ctx.reply(
        `🆔 Введите ID нового товара для связи с сайтом.\n\nВажно: ID должен быть уникальным!\n\n💡 Для отмены создания товара введите /cancel`
      );
    });

    // --- Просмотр детальной информации о товаре ---
    bot.action(/^view_product_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      
      try {
        const product = await productController.getProductById(productId);
        if (!product) {
          return ctx.editMessageText('Товар не найден.', {
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('🔙 Назад', 'admin_products')]
            ]).reply_markup,
          });
        }

        // Парсим спецификации
        let specsText = 'Не указаны';
        if (product.specs) {
          try {
            const specs = JSON.parse(product.specs);
            specsText = Object.entries(specs)
              .map(([key, value]) => `• ${key}: ${value}`)
              .join('\n');
          } catch (e) {
            specsText = product.specs;
          }
        }

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

        const message = `<b>📋 Детальная информация о товаре</b>

🆔 <b>ID:</b> ${product.id}
📦 <b>Название:</b> ${product.name}
💰 <b>Цена:</b> ${product.price.toLocaleString('ru-RU')} ₽
📝 <b>Описание:</b> ${product.description || 'Не указано'}

<b>🔧 Характеристики:</b>
${specsText}

<b>🖼 Изображения:</b>
• Основное: ${product.image ? 'Есть' : 'Нет'}
• FPS изображение: ${product.fpsImage ? 'Есть' : 'Нет'}
• Дополнительные: ${additionalImagesText}

⭐ <b>Ранг избранного:</b> ${product.favoriteRank || 0}
📅 <b>Создан:</b> ${new Date(product.createdAt).toLocaleDateString('ru-RU')}
📅 <b>Обновлен:</b> ${new Date(product.updatedAt).toLocaleDateString('ru-RU')}`;

        await ctx.editMessageText(message, {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.button.callback('✏️ Редактировать', `edit_product_${productId}`),
              Markup.button.callback('🗑 Удалить', `delete_product_${productId}`)
            ],
            [
              Markup.button.callback('📋 К товарам', `products_cat_${product.categoryId}`),
              Markup.button.callback('🔍 Поиск', `search_product_${product.categoryId}`)
            ]
          ]).reply_markup,
        });
      } catch (error) {
        console.error('Ошибка при просмотре товара:', error);
        await ctx.editMessageText('Произошла ошибка при получении информации о товаре.');
      }
    });

    // --- Редактирование товара - главное меню ---
    bot.action(/^edit_product_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      
      try {
        const product = await productController.getProductById(productId);
        if (!product) {
          return ctx.editMessageText('Товар не найден.');
        }

        const message = `<b>✏️ Редактирование товара:</b> ${product.name}

Выберите, что хотите изменить:`;

        await ctx.editMessageText(message, {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('📝 Название', `edit_product_name_${productId}`)],
            [Markup.button.callback('💰 Цена', `edit_product_price_${productId}`)],
            [Markup.button.callback('📋 Описание', `edit_product_description_${productId}`)],
            [Markup.button.callback('🔧 Характеристики', `edit_product_specs_${productId}`)],
            [Markup.button.callback('🖼 Основное изображение', `edit_product_image_${productId}`)],
            [Markup.button.callback('🎮 FPS изображение', `edit_product_fps_image_${productId}`)],
            [Markup.button.callback('📸 Доп. изображения', `edit_product_all_images_${productId}`)],
            [Markup.button.callback('⭐ Ранг избранного', `edit_product_rank_${productId}`)],
            [
              Markup.button.callback(`👁 Просмотреть "${product.name}"`, `view_product_${productId}`)
            ],
            [
              Markup.button.callback('📋 К товарам', `products_cat_${product.categoryId}`),
              Markup.button.callback('🔍 Поиск', `search_product_${product.categoryId}`)
            ]
          ]).reply_markup,
        });
      } catch (error) {
        console.error('Ошибка при редактировании товара:', error);
        await ctx.editMessageText('Произошла ошибка.');
      }
    });

    // --- Удаление товара ---
    bot.action(/^delete_product_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      
      try {
        const product = await productController.getProductById(productId);
        if (!product) {
          return ctx.editMessageText('Товар не найден.');
        }

        await ctx.editMessageText(
          `⚠️ <b>Подтверждение удаления</b>

Вы действительно хотите удалить товар:
<b>"${product.name}"</b> (ID: ${productId})?

<i>Это действие нельзя отменить!</i>`, 
          {
            parse_mode: 'HTML',
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.button.callback('✅ Да, удалить', `confirm_delete_product_${productId}`),
                Markup.button.callback('❌ Отменить', `view_product_${productId}`)
              ]
            ]).reply_markup,
          }
        );
      } catch (error) {
        console.error('Ошибка при удалении товара:', error);
        await ctx.editMessageText('Произошла ошибка.');
      }
    });

    // --- Подтверждение удаления товара ---
    bot.action(/^confirm_delete_product_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      
      try {
        const product = await productController.getProductById(productId);
        if (!product) {
          return ctx.editMessageText('Товар не найден.');
        }

        const categoryId = product.categoryId;
        await productController.deleteProduct(productId);

        await ctx.editMessageText(
          `✅ Товар "${product.name}" (ID: ${productId}) успешно удален!`,
          {
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('🔙 К товарам категории', `products_cat_${categoryId}`)]
            ]).reply_markup,
          }
        );
      } catch (error) {
        console.error('Ошибка при удалении товара:', error);
        await ctx.editMessageText('Произошла ошибка при удалении товара.');
      }
    });

    // --- Обработчики редактирования полей товара ---
    
    // Редактирование названия
    bot.action(/^edit_product_name_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      setState(ctx.from.id, `edit_name_${productId}`);
      await ctx.reply(
        `📝 Введите новое название товара:\n\n💡 Для отмены введите /cancel`
      );
    });

    // Редактирование цены
    bot.action(/^edit_product_price_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      setState(ctx.from.id, `edit_price_${productId}`);
      await ctx.reply(
        `💰 Введите новую цену товара (только число):\n\nПример: 150000\n\n💡 Для отмены введите /cancel`
      );
    });

    // Редактирование описания
    bot.action(/^edit_product_description_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      setState(ctx.from.id, `edit_description_${productId}`);
      await ctx.reply(
        `📋 Введите новое описание товара:\n\n💡 Для отмены введите /cancel`
      );
    });

    // Редактирование характеристик
    bot.action(/^edit_product_specs_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      setState(ctx.from.id, `edit_specs_${productId}`);
      await ctx.reply(
        `🔧 Введите новые характеристики в формате:\nКлюч: Значение\nКлюч: Значение\n\nПример:\nПроцессор: Intel i7-12700F\nВидеокарта: RTX 4070\nRAM: 16GB DDR4\n\n💡 Для отмены введите /cancel`
      );
    });

    // Редактирование основного изображения
    bot.action(/^edit_product_image_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      setState(ctx.from.id, `edit_image_${productId}`);
      await ctx.reply(
        `🖼 Отправьте новое основное изображение товара:\n\n📸 Фото (со сжатием) или 📎 Файл (без сжатия)\n\n💡 Для отмены введите /cancel`
      );
    });

    // Редактирование FPS изображения
    bot.action(/^edit_product_fps_image_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      setState(ctx.from.id, `edit_fps_image_${productId}`);
      await ctx.reply(
        `🎮 Отправьте новое FPS изображение товара:\n\n📸 Фото (со сжатием) или 📎 Файл (без сжатия)\nИли "-" для удаления\n\n💡 Для отмены введите /cancel`
      );
    });

    // Редактирование дополнительных изображений
    bot.action(/^edit_product_all_images_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      setState(ctx.from.id, `edit_all_images_${productId}`);
      await ctx.reply(
        `📸 Отправьте новые дополнительные изображения:\n\n📸 Можете отправлять по одному или альбомом\n\nКогда закончите, напишите "готово"\nДля удаления всех доп. изображений напишите "удалить"\n\n💡 Для отмены введите /cancel`
      );
    });

    // Редактирование ранга избранного
    bot.action(/^edit_product_rank_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const productId = parseInt(ctx.match[1]);
      setState(ctx.from.id, `edit_rank_${productId}`);
      await ctx.reply(
        `⭐ Введите новый ранг избранного (число от 0 до 100):\n\n0 - не избранное\n1-100 - уровень приоритета\n\n💡 Для отмены введите /cancel`
      );
    });

    // --- Обработка текстовых сообщений (для FSM админки) ---
    bot.on('text', async (ctx) => {
      const userId = ctx.from.id;
      const state = getState(userId);
      const text = ctx.message.text.trim();

      // Обработка команды отмены
      if (text === '/cancel' && state) {
        setState(userId, null); // Сбрасываем состояние
        await ctx.reply('❌ Создание товара отменено.');
        
        // Возвращаемся в админ панель
        setTimeout(async () => {
          try {
            const keyboard = await getMainMenuKeyboard(userId, webAppUrl);
            await ctx.reply('Вы вернулись в главное меню:', keyboard);
          } catch (error) {
            console.error('Ошибка при возвращении в главное меню:', error);
          }
        }, 500);
        return;
      }

      // Выход, если нет активного состояния для пользователя
      if (!state) {
        // Можно добавить ответ по умолчанию или пересылку админу
        // const keyboard = await getMainMenuKeyboard(userId);
        // return ctx.reply('Используйте кнопки меню.', keyboard);
        return; // Игнорируем обычный текст без состояния
      }

      // --- FSM для поиска товаров ---
      if (state.startsWith('search_in_category_')) {
        const catId = parseInt(state.replace('search_in_category_', ''));
        
        if (text.length < 1) {
          return ctx.reply(
            '❌ Поисковый запрос не может быть пустым. Введите название товара или его ID:\n\n💡 Для отмены введите /cancel'
          );
        }
        
        if (text.length > 50) {
          return ctx.reply(
            '❌ Поисковый запрос слишком длинный (максимум 50 символов). Попробуйте короче:\n\n💡 Для отмены введите /cancel'
          );
        }
        
        setState(userId, null); // Сбрасываем состояние поиска
        await showSearchResults(ctx, catId, text);
        return;
      }

      // --- FSM для добавления категории ---
      if (state === 'wait_category_name') {
        if (text.length < 2 || text.length > 50) {
          return ctx.reply(
            'Название категории должно быть от 2 до 50 символов. Попробуйте еще раз:'
          );
        }
        try {
          const category = await categoryController.createCategory({
            name: text,
          });
          setState(userId, null); // Сбрасываем состояние
          await ctx.reply(
            `Категория "${text}" (ID: ${category.id}) успешно создана!`
          );
          // Возвращаемся к списку категорий
          await showCategoriesList(ctx, false);
        } catch (error) {
          console.error('Ошибка при создании категории:', error);
          setState(userId, null); // Сбрасываем состояние при ошибке
          await ctx.reply(
            '❌ Произошла ошибка при создании категории. Возможно, имя уже занято.\n\nПопробуйте снова или используйте другое название.'
          );
          await showCategoriesList(ctx, false);
        }
        return; // Завершаем обработку
      }

      // --- FSM для добавления товара (улучшенная версия) ---
      
      // Шаг 1: Получаем ID товара
      if (state.startsWith('wait_product_id_')) {
        const catId = parseInt(state.replace('wait_product_id_', ''));
        const productId = parseInt(text);
        
        if (isNaN(productId) || productId <= 0) {
          return ctx.reply(
            '❌ ID должен быть положительным числом. Попробуйте еще раз:\n\n💡 Для отмены введите /cancel'
          );
        }
        
        // Проверяем уникальность ID
        try {
          const existingProduct = await productController.getProductById(productId);
          if (existingProduct) {
            return ctx.reply(
              `❌ Товар с ID ${productId} уже существует!\n\nВведите другой уникальный ID:\n\n💡 Для отмены введите /cancel`
            );
          }
        } catch (error) {
          // Если товар не найден - это хорошо, ID свободен
        }
        
        setState(userId, `wait_product_name_${catId}|||${productId}`);
        return ctx.reply(
          '📝 Введите название товара:\n\n💡 Для отмены введите /cancel'
        );
      }

      // Шаг 2: Получаем название товара
      if (state.startsWith('wait_product_name_')) {
        const [catId, productId] = state.replace('wait_product_name_', '').split('|||');
        
        if (text.length < 2 || text.length > 100) {
          return ctx.reply(
            'Название товара должно быть от 2 до 100 символов. Попробуйте еще раз:\n\n💡 Для отмены введите /cancel'
          );
        }
        setState(userId, `wait_product_price_${catId}|||${productId}|||${text}`);
        return ctx.reply(
          'Введите цену товара (только число, например: 99990):\n\n💡 Для отмены введите /cancel'
        );
      }

      // Шаг 3: Получаем цену товара
      if (state.startsWith('wait_product_price_')) {
        const [catId, productId, productName] = state.replace('wait_product_price_', '').split('|||');

        const priceText = text.replace(/\s/g, '').replace(',', '.');
        const price = parseFloat(priceText);

        if (isNaN(price) || price <= 0) {
          return ctx.reply(
            'Некорректная цена. Введите положительное число (например: 99990):\n\n💡 Для отмены введите /cancel'
          );
        }
        
        setState(userId, `wait_product_description_${catId}|||${productId}|||${productName}|||${price}`);
        return ctx.reply(
          'Введите полное описание товара (или "-" для пропуска):\n\n💡 Для отмены введите /cancel'
        );
      }

      // Шаг 4: Получаем описание товара
      if (state.startsWith('wait_product_description_')) {
        const [catId, productId, productName, priceStr] = state.replace('wait_product_description_', '').split('|||');
        const price = parseFloat(priceStr);
        const description = text === '-' ? null : text;
        
        setState(userId, `wait_product_specs_${catId}|||${productId}|||${productName}|||${price}|||${description || 'null'}`);
        return ctx.reply(
          `📋 Введите характеристики товара (каждая с новой строки).\n\nПример для ПК:\nПроцессор: Intel i7-12700F\nВидеокарта: RTX 4070\nRAM: 16GB DDR4\nSSD: 1TB NVMe\n\nПример для девайса:\nТип: Игровая мышь\nDPI: 16000\nПодключение: USB\nВес: 85г\n\nИли "-" для пропуска:\n\n💡 Для отмены введите /cancel`
        );
      }

      // Шаг 5: Получаем характеристики (преобразуем переносы строк в JSON)
      if (state.startsWith('wait_product_specs_')) {
        const [catId, productId, productName, priceStr, description] = state.replace('wait_product_specs_', '').split('|||');
        const price = parseFloat(priceStr);
        
        let specs = null;
        if (text !== '-') {
          try {
            // Преобразуем формат "ключ: значение" (каждая пара с новой строки) в JSON
            const specsObj = {};
            const pairs = text.split('\n').map(pair => pair.trim()).filter(pair => pair);
            
            if (pairs.length === 0) {
              throw new Error('Пустые характеристики');
            }
            
            for (const pair of pairs) {
              const colonIndex = pair.indexOf(':');
              if (colonIndex === -1) {
                throw new Error(`Некорректная строка "${pair}". Используйте формат "ключ: значение"`);
              }
              
              const key = pair.substring(0, colonIndex).trim();
              const value = pair.substring(colonIndex + 1).trim();
              
              if (!key || !value) {
                throw new Error(`Некорректная строка "${pair}". Ключ и значение не должны быть пустыми`);
              }
              
              specsObj[key] = value;
            }
            
            specs = JSON.stringify(specsObj);
          } catch (error) {
          return ctx.reply(
              `❌ Некорректный формат характеристик!\n\nОшибка: ${error.message}\n\nПравильный формат (каждая с новой строки):\nПроцессор: Intel i7\nВидеокарта: RTX 4070\nRAM: 16GB\n\nПопробуйте еще раз или введите "-" для пропуска:\n\n💡 Для отмены введите /cancel`
            );
          }
        }
        
        setState(userId, `wait_product_image_${catId}|||${productId}|||${productName}|||${price}|||${description}|||${specs || 'null'}`);
        return ctx.reply(
          '🖼️ Отправьте основное изображение товара:\n\n📸 Фото (со сжатием) - быстрая отправка\n📎 Файл (без сжатия) - лучшее качество\n\nИли "-" для пропуска:\n\n💡 Для отмены введите /cancel'
        );
      }

      // Шаг 6: Получаем основное изображение (только текстовая команда пропуска)
      if (state.startsWith('wait_product_image_')) {
        const [catId, productId, productName, priceStr, description, specs] = state.replace('wait_product_image_', '').split('|||');
        const price = parseFloat(priceStr);
        
        // Проверяем текстовое сообщение для пропуска
        if (text === '-') {
          setState(userId, `wait_product_fps_image_${catId}|||${productId}|||${productName}|||${price}|||${description}|||${specs}|||null`);
          return ctx.reply(
            '🎮 Отправьте изображение с FPS тестами:\n\n📸 Фото (со сжатием) или 📎 Файл (без сжатия)\n\nИли "-" для пропуска:\n\n💡 Для отмены введите /cancel'
          );
        }
        
        // Если не "-", просим отправить корректные данные
        return ctx.reply(
          '❌ Пожалуйста, отправьте изображение (📸 фото или 📎 файл) или "-" для пропуска.\n\n💡 Для отмены введите /cancel'
        );
      }

      // Шаг 7: Получаем FPS изображение (только текстовая команда пропуска)
      if (state.startsWith('wait_product_fps_image_')) {
        const [catId, productId, productName, priceStr, description, specs, image] = state.replace('wait_product_fps_image_', '').split('|||');
        const price = parseFloat(priceStr);
        
        // Проверяем текстовое сообщение для пропуска
        if (text === '-') {
          setState(userId, `wait_product_all_images_${catId}|||${productId}|||${productName}|||${price}|||${description}|||${specs}|||${image}|||null`);
          return ctx.reply(
            `📸 Отправляйте дополнительные изображения товара:\n\n• 🖼️ По одному (фото или файлы)\n• 📚 Альбомом до 10 изображений сразу\n\nКогда закончите, напишите "готово" или "-" для пропуска:\n\n💡 Для отмены введите /cancel`
          );
        }
        
        // Если не "-", просим отправить корректные данные
        return ctx.reply(
          '❌ Пожалуйста, отправьте изображение (📸 фото или 📎 файл) или "-" для пропуска.\n\n💡 Для отмены введите /cancel'
        );
      }

      // Шаг 8: Получаем дополнительные изображения (только текстовые команды)
      if (state.startsWith('wait_product_all_images_')) {
        const stateParts = state.replace('wait_product_all_images_', '').split('|||');
        const [catId, productId, productName, priceStr, description, specs, image, fpsImage] = stateParts.slice(0, 8);
        // Дополнительные изображения могут быть уже накоплены в state
        const existingImages = stateParts.slice(8) || [];
        const price = parseFloat(priceStr);
        
        // Проверяем команды завершения или пропуска
        if (text === 'готово' || text === '-') {
          let allImagesJson = null;
          if (existingImages.length > 0) {
            allImagesJson = JSON.stringify(existingImages);
          }
          
          setState(userId, `wait_product_rank_${catId}|||${productId}|||${productName}|||${price}|||${description}|||${specs}|||${image}|||${fpsImage}|||${allImagesJson || 'null'}`);
          return ctx.reply(
            `⭐ Введите ранг товара для "лучших предложений" (0-100, где 0 = обычный товар, 100 = топ предложение):\n\nИли "-" для установки 0:\n\n💡 Для отмены введите /cancel`
          );
        }
        
        // Если не команда завершения
        return ctx.reply(
          '❌ Пожалуйста, отправьте изображение (📸 фото или 📎 файл), напишите "готово" для завершения или "-" для пропуска.\n\n💡 Для отмены введите /cancel'
        );
      }

      // Шаг 9: Получаем ранг и создаем товар
      if (state.startsWith('wait_product_rank_')) {
        const [catId, productId, productName, priceStr, description, specs, image, fpsImage, allImages] = state.replace('wait_product_rank_', '').split('|||');
        const price = parseFloat(priceStr);
        const id = parseInt(productId);
        
        let favoriteRank = 0;
        if (text !== '-') {
          favoriteRank = parseInt(text);
          if (isNaN(favoriteRank) || favoriteRank < 0 || favoriteRank > 100) {
            return ctx.reply(
              '❌ Ранг должен быть числом от 0 до 100. Попробуйте еще раз или "-" для 0:\n\n💡 Для отмены введите /cancel'
            );
          }
        }

        try {
          // Показываем сообщение о начале загрузки
          await ctx.reply('📤 Загружаю изображения в хранилище...');
          
          // Загружаем все изображения в S3
          let uploadedImages = {};
          
          // Проверяем, настроен ли S3 сервис
          if (s3Service.isConfigured()) {
            // Получаем информацию о категории для правильной организации файлов
            const category = await categoryController.getCategoryById(parseInt(catId));
            if (!category) {
              throw new Error(`Категория с ID ${catId} не найдена`);
            }
            
            uploadedImages = await s3Service.uploadProductImages({
              mainImage: image === 'null' ? null : image,
              fpsImage: fpsImage === 'null' ? null : fpsImage,
              additionalImages: allImages === 'null' ? null : allImages,
              productInfo: {
                productId: id,
                productName: productName,
                categoryId: parseInt(catId),
                categoryName: category.name
              }
            });
            console.log('Изображения загружены в S3:', uploadedImages);
          } else {
            console.warn('S3 не настроен, сохраняем file_id в базу данных');
            // Если S3 не настроен, сохраняем file_id как есть (для разработки)
            // Убеждаемся что additionalImages остается JSON массивом
            uploadedImages = {
              mainImageUrl: image === 'null' ? null : image,
              fpsImageUrl: fpsImage === 'null' ? null : fpsImage,
              additionalImagesUrls: allImages === 'null' ? null : allImages // уже JSON строка из FSM
            };
          }

          // Формируем данные для создания товара с S3 ссылками
          const productData = {
            id: id,
            name: productName,
            price: price,
            description: description === 'null' ? null : description,
            specs: specs === 'null' ? null : specs,
            image: uploadedImages.mainImageUrl,
            fpsImage: uploadedImages.fpsImageUrl,
            allImages: uploadedImages.additionalImagesUrls,
            favoriteRank: favoriteRank,
            categoryId: parseInt(catId),
          };

          console.log('Создаем товар с данными:', productData);
          
          const product = await productController.createProduct(productData);
          setState(userId, null); // Сбрасываем состояние
          
          // Формируем сообщение с полной информацией о созданном товаре
          let successMessage = `✅ <b>Товар успешно создан!</b>\n\n`;
          successMessage += `🆔 <b>ID:</b> ${product.id}\n`;
          successMessage += `🏷️ <b>Название:</b> ${productName}\n`;
          successMessage += `💰 <b>Цена:</b> ${price.toLocaleString('ru-RU')} ₽\n`;
          
          if (favoriteRank > 0) {
            successMessage += `⭐ <b>Ранг:</b> ${favoriteRank}/100\n`;
          }
          
          // Информация о загруженных изображениях
          let imageCount = 0;
          if (uploadedImages.mainImageUrl) imageCount++;
          if (uploadedImages.fpsImageUrl) imageCount++;
          if (uploadedImages.additionalImagesUrls) {
            try {
              const additionalUrls = JSON.parse(uploadedImages.additionalImagesUrls);
              imageCount += additionalUrls.length;
            } catch (e) {}
          }
          if (imageCount > 0) {
            successMessage += `📸 <b>Изображений загружено:</b> ${imageCount}\n`;
          }
          
          if (description && description !== 'null') {
            successMessage += `📝 <b>Описание:</b> ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}\n`;
          }
          
          // Показываем характеристики если есть
          if (specs && specs !== 'null') {
            try {
              const specsObj = JSON.parse(specs);
              const specsDisplay = Object.entries(specsObj).map(([key, value]) => `${key}: ${value}`).join('\n');
              successMessage += `📋 <b>Характеристики:</b>\n${specsDisplay.substring(0, 200)}${specsDisplay.length > 200 ? '...' : ''}\n`;
            } catch (e) {
              console.error('Ошибка при парсинге specs:', e);
            }
          }
          
          await ctx.reply(successMessage, { parse_mode: 'HTML' });
          
          // Возвращаемся к списку товаров этой категории
          setTimeout(async () => {
            try {
              await showProductsPage(ctx, parseInt(catId), 0);
            } catch (error) {
              console.error('Ошибка при возвращении к списку товаров:', error);
            }
          }, 1000);
          
        } catch (error) {
          console.error('Ошибка при создании товара:', error);
          
          let errorMessage = '❌ Произошла ошибка при создании товара:\n\n';
          
          if (error.message.includes('S3')) {
            errorMessage += '📤 Ошибка загрузки изображений в хранилище.\nПроверьте настройки S3 или попробуйте позже.';
          } else if (error.message.includes('unique') || error.message.includes('UNIQUE')) {
            errorMessage += `🆔 Товар с ID ${id} уже существует!\nВыберите другой ID.`;
          } else if (error.message.includes('file_id') || error.message.includes('Telegram')) {
            errorMessage += '📸 Ошибка обработки изображений.\nПопробуйте отправить изображения заново.';
          } else {
            errorMessage += 'Неизвестная ошибка. Проверьте данные или попробуйте позже.';
          }
          
          errorMessage += '\n\n💡 Создание товара отменено. Для новой попытки используйте /admin';
          
          await ctx.reply(errorMessage);
          setState(userId, null); // Сбрасываем состояние при ошибке
        }
        return; // Завершаем обработку
      }

      // --- FSM для редактирования товаров ---
      
      // Редактирование названия товара
      if (state.startsWith('edit_name_')) {
        const productId = parseInt(state.replace('edit_name_', ''));
        
        if (text.length < 2 || text.length > 100) {
          return ctx.reply(
            '❌ Название товара должно быть от 2 до 100 символов. Попробуйте еще раз:\n\n💡 Для отмены введите /cancel'
          );
        }
        
        try {
          await productController.updateProduct(productId, { name: text });
          setState(userId, null);
          await ctx.reply(`✅ Название товара обновлено на: "${text}"`);
          
          // Возвращаемся к просмотру товара
          setTimeout(async () => {
            await bot.actions[`view_product_${productId}`](ctx);
          }, 500);
        } catch (error) {
          console.error('Ошибка при обновлении названия:', error);
          await ctx.reply('❌ Произошла ошибка при обновлении названия.');
        }
        return;
      }
      
      // Редактирование цены товара
      if (state.startsWith('edit_price_')) {
        const productId = parseInt(state.replace('edit_price_', ''));
        
        const priceText = text.replace(/\s/g, '').replace(',', '.');
        const price = parseFloat(priceText);
        
        if (isNaN(price) || price <= 0) {
          return ctx.reply(
            '❌ Некорректная цена. Введите положительное число (например: 99990):\n\n💡 Для отмены введите /cancel'
          );
        }
        
        try {
          await productController.updateProduct(productId, { price });
          setState(userId, null);
          await ctx.reply(`✅ Цена товара обновлена на: ${price.toLocaleString('ru-RU')} ₽`);
          
          // Возвращаемся к просмотру товара
          setTimeout(async () => {
            await bot.actions[`view_product_${productId}`](ctx);
          }, 500);
        } catch (error) {
          console.error('Ошибка при обновлении цены:', error);
          await ctx.reply('❌ Произошла ошибка при обновлении цены.');
        }
        return;
      }
      
      // Редактирование описания товара
      if (state.startsWith('edit_description_')) {
        const productId = parseInt(state.replace('edit_description_', ''));
        
        const description = text === '-' ? null : text;
        
        try {
          await productController.updateProduct(productId, { description });
          setState(userId, null);
          await ctx.reply(
            `✅ Описание товара ${description ? 'обновлено' : 'удалено'}`
          );
          
          // Возвращаемся к просмотру товара
          setTimeout(async () => {
            await bot.actions[`view_product_${productId}`](ctx);
          }, 500);
        } catch (error) {
          console.error('Ошибка при обновлении описания:', error);
          await ctx.reply('❌ Произошла ошибка при обновлении описания.');
        }
        return;
      }
      
      // Редактирование характеристик товара
      if (state.startsWith('edit_specs_')) {
        const productId = parseInt(state.replace('edit_specs_', ''));
        
        let specs = null;
        if (text !== '-') {
          try {
            // Преобразуем формат "ключ: значение" в JSON
            const specsObj = {};
            const pairs = text.split('\n').map(pair => pair.trim()).filter(pair => pair);
            
            if (pairs.length === 0) {
              throw new Error('Пустые характеристики');
            }
            
            for (const pair of pairs) {
              const colonIndex = pair.indexOf(':');
              if (colonIndex === -1) {
                throw new Error(`Некорректная строка "${pair}". Используйте формат "ключ: значение"`);
              }
              
              const key = pair.substring(0, colonIndex).trim();
              const value = pair.substring(colonIndex + 1).trim();
              
              if (!key || !value) {
                throw new Error(`Некорректная строка "${pair}". Ключ и значение не должны быть пустыми`);
              }
              
              specsObj[key] = value;
            }
            
            specs = JSON.stringify(specsObj);
          } catch (error) {
            return ctx.reply(
              `❌ Некорректный формат характеристик!\n\nОшибка: ${error.message}\n\nПравильный формат:\nПроцессор: Intel i7\nВидеокарта: RTX 4070\nRAM: 16GB\n\nПопробуйте еще раз или введите "-" для удаления:\n\n💡 Для отмены введите /cancel`
            );
          }
        }
        
        try {
          await productController.updateProduct(productId, { specs });
          setState(userId, null);
          await ctx.reply(
            `✅ Характеристики товара ${specs ? 'обновлены' : 'удалены'}`
          );
          
          // Возвращаемся к просмотру товара
          setTimeout(async () => {
            await bot.actions[`view_product_${productId}`](ctx);
          }, 500);
        } catch (error) {
          console.error('Ошибка при обновлении характеристик:', error);
          await ctx.reply('❌ Произошла ошибка при обновлении характеристик.');
        }
        return;
      }
      
      // Редактирование ранга избранного
      if (state.startsWith('edit_rank_')) {
        const productId = parseInt(state.replace('edit_rank_', ''));
        
        let favoriteRank = 0;
        if (text !== '-') {
          favoriteRank = parseInt(text);
          if (isNaN(favoriteRank) || favoriteRank < 0 || favoriteRank > 100) {
            return ctx.reply(
              '❌ Ранг должен быть числом от 0 до 100. Попробуйте еще раз или "-" для 0:\n\n💡 Для отмены введите /cancel'
            );
          }
        }
        
        try {
          await productController.updateProduct(productId, { favoriteRank });
          setState(userId, null);
          await ctx.reply(`✅ Ранг избранного обновлен на: ${favoriteRank}`);
          
          // Возвращаемся к просмотру товара
          setTimeout(async () => {
            await bot.actions[`view_product_${productId}`](ctx);
          }, 500);
        } catch (error) {
          console.error('Ошибка при обновлении ранга:', error);
          await ctx.reply('❌ Произошла ошибка при обновлении ранга.');
        }
        return;
      }
      
      // Редактирование основного изображения (только текстовая команда пропуска)
      if (state.startsWith('edit_image_')) {
        const productId = parseInt(state.replace('edit_image_', ''));
        
        // Проверяем текстовое сообщение для удаления
        if (text === '-') {
          try {
            await productController.updateProduct(productId, { image: null });
            setState(userId, null);
            await ctx.reply('✅ Основное изображение удалено');
            
            // Возвращаемся к просмотру товара
            setTimeout(async () => {
              await bot.actions[`view_product_${productId}`](ctx);
            }, 500);
          } catch (error) {
            console.error('Ошибка при удалении изображения:', error);
            await ctx.reply('❌ Произошла ошибка при удалении изображения.');
          }
          return;
        }
        
        // Если не "-", просим отправить корректные данные
        return ctx.reply(
          '❌ Пожалуйста, отправьте изображение (📸 фото или 📎 файл) или "-" для удаления.\n\n💡 Для отмены введите /cancel'
        );
      }
      
      // Редактирование FPS изображения (только текстовая команда пропуска)
      if (state.startsWith('edit_fps_image_')) {
        const productId = parseInt(state.replace('edit_fps_image_', ''));
        
        // Проверяем текстовое сообщение для удаления
        if (text === '-') {
          try {
            await productController.updateProduct(productId, { fpsImage: null });
            setState(userId, null);
            await ctx.reply('✅ FPS изображение удалено');
            
            // Возвращаемся к просмотру товара
            setTimeout(async () => {
              await bot.actions[`view_product_${productId}`](ctx);
            }, 500);
          } catch (error) {
            console.error('Ошибка при удалении FPS изображения:', error);
            await ctx.reply('❌ Произошла ошибка при удалении FPS изображения.');
          }
          return;
        }
        
        // Если не "-", просим отправить корректные данные
        return ctx.reply(
          '❌ Пожалуйста, отправьте изображение (📸 фото или 📎 файл) или "-" для удаления.\n\n💡 Для отмены введите /cancel'
        );
      }
      
      // Редактирование дополнительных изображений (только текстовые команды)
      if (state.startsWith('edit_all_images_')) {
        const stateParts = state.replace('edit_all_images_', '').split('|||');
        const productId = parseInt(stateParts[0]);
        const newImages = stateParts.slice(1) || [];
        
        // Проверяем команды
        if (text === 'готово') {
          try {
            if (newImages.length === 0) {
              // Если нет накопленных изображений, завершаем без изменений
              setState(userId, null);
              await ctx.reply('✅ Редактирование дополнительных изображений завершено без изменений');
            } else {
              // Показываем сообщение о начале загрузки
              await ctx.reply(`📤 Загружаю ${newImages.length} дополнительных изображений в хранилище...`);
              
              // Загружаем изображения в S3
              let newAllImagesJson = JSON.stringify(newImages); // Значение по умолчанию если S3 не настроен
              
              if (s3Service.isConfigured()) {
                // Получаем информацию о товаре для правильной организации файлов
                const product = await productController.getProductById(productId);
                if (!product) {
                  throw new Error('Товар не найден');
                }
                
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
              setState(userId, null);
              await ctx.reply(`✅ ${newImages.length} дополнительных изображений обновлены!`);
            }
            
            // Возвращаемся к просмотру товара
            setTimeout(async () => {
              await bot.actions[`view_product_${productId}`](ctx);
            }, 500);
          } catch (error) {
            console.error('Ошибка при обновлении дополнительных изображений:', error);
            await ctx.reply('❌ Произошла ошибка при обновлении дополнительных изображений.');
          }
          return;
        }
        
        if (text === 'удалить') {
          try {
            await productController.updateProduct(productId, { allImages: null });
            setState(userId, null);
            await ctx.reply('✅ Все дополнительные изображения удалены');
            
            // Возвращаемся к просмотру товара
            setTimeout(async () => {
              await bot.actions[`view_product_${productId}`](ctx);
            }, 500);
          } catch (error) {
            console.error('Ошибка при удалении доп. изображений:', error);
            await ctx.reply('❌ Произошла ошибка при удалении дополнительных изображений.');
          }
          return;
        }
        
        // Если не команда завершения
        return ctx.reply(
          '❌ Пожалуйста, отправьте изображения, напишите "готово" для завершения или "удалить" для удаления всех доп. изображений.\n\n💡 Для отмены введите /cancel'
        );
      }

      // --- FSM для создания и редактирования категории (текстовые сообщения) ---
      if (state === 'wait_new_category_name') {
        if (text.length < 2 || text.length > 50) {
          return ctx.reply('Название категории должно быть от 2 до 50 символов. Попробуйте еще раз:');
        }
        setState(userId, `wait_new_category_desc|||${text}`);
        return ctx.reply('📋 Введите описание категории (или "-" для пропуска):\n\n💡 Для отмены введите /cancel');
      }
      // FSM: создание категории (шаг 2)
      if (state && state.startsWith('wait_new_category_desc|||')) {
        const name = state.replace('wait_new_category_desc|||', '');
        const desc = text === '-' ? null : text;
        setState(userId, `wait_new_category_image|||${name}|||${desc || ''}`);
        return ctx.reply('🖼 Отправьте изображение категории (или "-" для пропуска):\n\n💡 Для отмены введите /cancel');
      }
      // FSM: создание категории (шаг 3, пропуск изображения)
      if (state && state.startsWith('wait_new_category_image|||')) {
        const [_, name, desc] = state.split('|||');
        if (text === '-') {
          // Создаем категорию без изображения
          try {
            const category = await categoryController.createCategory({
              name,
              description: desc || null,
              image: null,
            });
            setState(userId, null);
            await ctx.reply(`✅ Категория "${name}" успешно создана!`);
            await showCategoriesList(ctx, false);
          } catch (error) {
            console.error('Ошибка при создании категории:', error);
          setState(userId, null); // Сбрасываем состояние при ошибке
            await ctx.reply('❌ Ошибка при создании категории. Возможно, имя уже занято.\n\nПопробуйте снова или используйте другое название.');
            await showCategoriesList(ctx, false);
          }
          return;
        }
        // Если не "-", просим отправить изображение
        return ctx.reply('❌ Пожалуйста, отправьте изображение или "-" для пропуска.\n\n💡 Для отмены введите /cancel');
      }

      // FSM: редактирование названия категории
      if (state && state.startsWith('edit_category_name_')) {
        const catId = parseInt(state.replace('edit_category_name_', ''));
        if (text.length < 2 || text.length > 50) {
          return ctx.reply('Название категории должно быть от 2 до 50 символов. Попробуйте еще раз:');
        }
        try {
          await categoryController.updateCategory(catId, { name: text });
          setState(userId, null);
          await ctx.reply(`✅ Название категории обновлено на: "${text}"`);
          setTimeout(async () => { await bot.actions[`view_category_${catId}`](ctx); }, 500);
        } catch (error) {
          await ctx.reply('Ошибка при обновлении названия категории.');
        }
        return;
      }
      // FSM: редактирование описания категории
      if (state && state.startsWith('edit_category_desc_')) {
        const catId = parseInt(state.replace('edit_category_desc_', ''));
        const desc = text === '-' ? null : text;
        try {
          await categoryController.updateCategory(catId, { description: desc });
          setState(userId, null);
          await ctx.reply(`✅ Описание категории ${desc ? 'обновлено' : 'удалено'}`);
          setTimeout(async () => { await bot.actions[`view_category_${catId}`](ctx); }, 500);
        } catch (error) {
          await ctx.reply('Ошибка при обновлении описания категории.');
        }
        return;
      }
      // FSM: редактирование изображения категории (только текстовая команда пропуска)
      if (state && state.startsWith('edit_category_image_')) {
        const catId = parseInt(state.replace('edit_category_image_', ''));
        if (text === '-') {
          try {
            await categoryController.updateCategory(catId, { image: null });
            setState(userId, null);
            await ctx.reply('✅ Изображение категории удалено');
            setTimeout(async () => { await bot.actions[`view_category_${catId}`](ctx); }, 500);
          } catch (error) {
            await ctx.reply('Ошибка при удалении изображения категории.');
          }
          return;
        }
        return ctx.reply('❌ Пожалуйста, отправьте изображение или "-" для удаления.\n\n💡 Для отмены введите /cancel');
      }
    });

    // --- FSM для создания и редактирования категории (фото/документы) ---
    bot.on(['photo', 'document'], async (ctx) => {
      const userId = ctx.from.id;
      const state = getState(userId);
      let fileId = null;
      if (ctx.message.photo) {
        // Берем наилучшее качество
        fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      } else if (ctx.message.document) {
        const doc = ctx.message.document;
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!doc.mime_type || !imageTypes.includes(doc.mime_type.toLowerCase())) {
          return ctx.reply('❌ Пожалуйста, отправьте изображение (JPEG, PNG, WebP или GIF).');
        }
        fileId = doc.file_id;
      }
      if (!state || !fileId) return;

      // FSM: создание категории (шаг 3, изображение)
      if (state.startsWith('wait_new_category_image|||')) {
        const [_, name, desc] = state.split('|||');
        try {
          let imageUrl = fileId;
          if (s3Service.isConfigured()) {
            // Загружаем в S3
            const uploadResult = await s3Service.uploadCategoryImage({ fileId, categoryName: name });
            imageUrl = uploadResult.url;
          }
          const category = await categoryController.createCategory({
            name,
            description: desc || null,
            image: imageUrl,
          });
          setState(userId, null);
          await ctx.reply(`✅ Категория "${name}" успешно создана!`);
          await showCategoriesList(ctx, false);
        } catch (error) {
          console.error('Ошибка при создании категории с изображением:', error);
          setState(userId, null); // Сбрасываем состояние при ошибке
          await ctx.reply('❌ Ошибка при создании категории с изображением. Возможно, имя уже занято.\n\nПопробуйте снова или используйте другое название.');
          await showCategoriesList(ctx, false);
        }
        return;
      }
      // FSM: редактирование изображения категории
      if (state.startsWith('edit_category_image_')) {
        const catId = parseInt(state.replace('edit_category_image_', ''));
        try {
          let imageUrl = fileId;
          if (s3Service.isConfigured()) {
            // Загружаем в S3
            const cat = await categoryController.getCategoryById(catId);
            const uploadResult = await s3Service.uploadCategoryImage({ fileId, categoryName: cat.name });
            imageUrl = uploadResult.url;
          }
          await categoryController.updateCategory(catId, { image: imageUrl });
          setState(userId, null);
          await ctx.reply('✅ Изображение категории обновлено!');
          setTimeout(async () => { await bot.actions[`view_category_${catId}`](ctx); }, 500);
        } catch (error) {
          await ctx.reply('Ошибка при обновлении изображения категории.');
        }
        return;
      }
    });

    // --- Обработка фото для FSM ---
    bot.on('photo', async (ctx) => {
      const userId = ctx.from.id;
      const state = getState(userId);
      
      // Если нет состояния, игнорируем фото
      if (!state) {
        return;
      }
      
      // Получаем фото наилучшего качества
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const fileId = photo.file_id;
      
      // Проверяем, является ли фото частью медиа-группы (альбома)
      if (ctx.message.media_group_id) {
        // Это часть альбома - обрабатываем особым образом
        await handleMediaGroupPhoto(ctx, userId, state, fileId, ctx.message.media_group_id);
        return;
      }
      
      // Используем новые функции для обработки
      return await handleSinglePhoto(ctx, userId, state, fileId);
    });

    // --- Обработка документов (изображений без сжатия) для FSM ---
    bot.on('document', async (ctx) => {
      const userId = ctx.from.id;
      const state = getState(userId);
      
      // Если нет состояния, игнорируем документ
      if (!state) {
        return;
      }
      
      const document = ctx.message.document;
      
      // Проверяем, является ли документ изображением
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!document.mime_type || !imageTypes.includes(document.mime_type.toLowerCase())) {
        return ctx.reply(
          '❌ Пожалуйста, отправьте изображение (JPEG, PNG, WebP или GIF).\n\n💡 Если отправляете как файл, убедитесь что это изображение'
        );
      }
      
      // Проверяем размер файла (макс 20MB для Telegram Bot API)
      if (document.file_size > 20 * 1024 * 1024) {
        return ctx.reply(
          '❌ Изображение слишком большое (максимум 20MB).\n\nПопробуйте сжать изображение или отправить с галочкой "Сжать изображение".'
        );
      }
      
      const fileId = document.file_id;
      
      // Используем те же функции что и для фото, но добавляем уточнение о файле
      if (state.startsWith('wait_product_image_')) {
        const [catId, productId, productName, priceStr, description, specs] = state.replace('wait_product_image_', '').split('|||');
        
        setState(userId, `wait_product_fps_image_${catId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${fileId}`);
        return ctx.reply(
          '✅ Основное изображение получено! (загружено как файл)\n\n🎮 Отправьте изображение с FPS тестами:\n\n📸 Фото (со сжатием) или 📎 Файл (без сжатия)\n\nИли "-" для пропуска:\n\n💡 Для отмены введите /cancel'
        );
      }
      
      if (state.startsWith('wait_product_fps_image_')) {
        const [catId, productId, productName, priceStr, description, specs, image] = state.replace('wait_product_fps_image_', '').split('|||');
        
        setState(userId, `wait_product_all_images_${catId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${image}|||${fileId}`);
        return ctx.reply(
          '✅ FPS изображение получено! (загружено как файл)\n\n📸 Отправляйте дополнительные изображения товара:\n\n• 🖼️ По одному (фото или файлы)\n• 📚 Альбомом до 10 изображений сразу\n\nКогда закончите, напишите "готово" или "-" для пропуска:\n\n💡 Для отмены введите /cancel'
        );
      }
      
      if (state.startsWith('wait_product_all_images_')) {
        const stateParts = state.replace('wait_product_all_images_', '').split('|||');
        const [catId, productId, productName, priceStr, description, specs, image, fpsImage] = stateParts.slice(0, 8);
        const existingImages = stateParts.slice(8) || [];
        
        // Добавляем новый file_id к существующим
        const updatedImages = [...existingImages, fileId];
        const newState = `wait_product_all_images_${catId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${image}|||${fpsImage}|||${updatedImages.join('|||')}`;
        
        setState(userId, newState);
        return ctx.reply(
          `✅ Дополнительное изображение ${updatedImages.length} получено! (загружено как файл)\n\n📸 Отправьте еще изображения:\n• Одиночными или альбомом\n• Или напишите "готово" для завершения\n\n💡 Для отмены введите /cancel`
        );
      }
      
      // --- Редактирование изображений (документы) ---
      
      // Редактирование основного изображения
      if (state.startsWith('edit_image_')) {
        const productId = parseInt(state.replace('edit_image_', ''));
        
        try {
          // Показываем сообщение о начале загрузки
          await ctx.reply('📤 Загружаю изображение в хранилище... (загружено как файл)');
          
          // Загружаем изображение в S3
          let newImageUrl = fileId; // Значение по умолчанию для случая если S3 не настроен
          
          if (s3Service.isConfigured()) {
            // Получаем информацию о товаре для правильной организации файлов
            const product = await productController.getProductById(productId);
            if (!product) {
              throw new Error('Товар не найден');
            }
            
            const category = await categoryController.getCategoryById(product.categoryId);
            if (!category) {
              throw new Error('Категория не найдена');
            }
            
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
          setState(userId, null);
          await ctx.reply('✅ Основное изображение обновлено!');
          
          // Возвращаемся к просмотру товара
          setTimeout(async () => {
            await bot.actions[`view_product_${productId}`](ctx);
          }, 500);
        } catch (error) {
          console.error('Ошибка при обновлении основного изображения:', error);
          await ctx.reply('❌ Произошла ошибка при обновлении изображения.');
        }
        return;
      }
      
      // Редактирование FPS изображения
      if (state.startsWith('edit_fps_image_')) {
        const productId = parseInt(state.replace('edit_fps_image_', ''));
        
        try {
          // Показываем сообщение о начале загрузки
          await ctx.reply('📤 Загружаю FPS изображение в хранилище... (загружено как файл)');
          
          // Загружаем изображение в S3
          let newFpsImageUrl = fileId; // Значение по умолчанию для случая если S3 не настроен
          
          if (s3Service.isConfigured()) {
            // Получаем информацию о товаре для правильной организации файлов
            const product = await productController.getProductById(productId);
            if (!product) {
              throw new Error('Товар не найден');
            }
            
            const category = await categoryController.getCategoryById(product.categoryId);
            if (!category) {
              throw new Error('Категория не найдена');
            }
            
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
          setState(userId, null);
          await ctx.reply('✅ FPS изображение обновлено!');
          
          // Возвращаемся к просмотру товара
          setTimeout(async () => {
            await bot.actions[`view_product_${productId}`](ctx);
          }, 500);
        } catch (error) {
          console.error('Ошибка при обновлении FPS изображения:', error);
          await ctx.reply('❌ Произошла ошибка при обновлении FPS изображения.');
        }
        return;
      }
      
      // Редактирование дополнительных изображений
      if (state.startsWith('edit_all_images_')) {
        const stateParts = state.replace('edit_all_images_', '').split('|||');
        const productId = parseInt(stateParts[0]);
        const existingImages = stateParts.slice(1) || [];
        
        // Добавляем новый file_id к существующим
        const updatedImages = [...existingImages, fileId];
        const newState = `edit_all_images_${productId}|||${updatedImages.join('|||')}`;
        
        setState(userId, newState);
        return ctx.reply(
          `✅ Дополнительное изображение ${updatedImages.length} получено! (загружено как файл)\n\n📸 Отправьте еще изображения или напишите "готово" для сохранения:\n\n💡 Для отмены введите /cancel`
        );
      }

      // Если документ отправлен не в нужном состоянии
      return ctx.reply(
        '❌ Изображение сейчас не ожидается. Используйте кнопки меню для навигации.\n\n💡 Для отмены текущего действия введите /cancel'
      );
    });

    // --- Запуск бота ---
    await bot.launch({
      dropPendingUpdates: true, // Игнорируем старые сообщения при перезапуске
    });
    console.log(
      `[INIT] Telegram бот @${bot.botInfo.username} успешно запущен!`
    );
    console.log(`[INIT] WebApp URL используется: ${webAppUrl}`);

    // --- Корректное завершение работы ---
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    return bot;
  } catch (error) {
    console.error(
      '[CRITICAL] Ошибка при инициализации или запуске бота:',
      error
    );
    // Можно добавить отправку уведомления администратору об ошибке запуска
    throw error; // Пробрасываем ошибку дальше
  }
};



// --- Экспорт ---
module.exports = {
  initBot, // Экспортируем функцию инициализации
  // Не экспортируем сам 'bot', чтобы избежать случайного использования до инициализации
  // Если нужен доступ к bot.telegram для отправки сообщений из других модулей,
  // можно сделать функцию-обертку или передавать его после инициализации.
};
