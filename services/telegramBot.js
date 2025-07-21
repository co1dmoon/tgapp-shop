const { Telegraf, Markup, message } = require('telegraf');
require('dotenv').config(); // Убедимся, что dotenv загружен

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
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
  buttons.push([Markup.button.callback('Мои заказы', 'my_orders')]);
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

      // Проверяем, есть ли пользователь с номером телефона в базе
      try {
        const user = await userController.getUserByTelegramId(userId);

        // Если у пользователя нет номера телефона, запрашиваем его
        if (!user || !user.phoneNumber) {
          return ctx.reply(
            `👋 Привет, ${userName}! Для продолжения работы с ботом, пожалуйста, поделитесь своим номером телефона.`,
            Markup.keyboard([
              [Markup.button.contactRequest('📱 Поделиться номером телефона')],
            ]).resize()
          );
        }

        // Если номер телефона уже есть, показываем главное меню
        const keyboard = await getMainMenuKeyboard(userId, webAppUrl);
        return ctx.reply(
          `👋 Привет, ${userName}! Добро пожаловать в b.ZONE pc. Выберите действие:`,
          keyboard
        );
      } catch (error) {
        console.error('Ошибка при проверке пользователя:', error);
        // В случае ошибки все равно показываем главное меню
        const keyboard = await getMainMenuKeyboard(userId, webAppUrl);
        return ctx.reply(
          `👋 Привет, ${userName}! Добро пожаловать в b.ZONE pc. Выберите действие:`,
          keyboard
        );
      }
    });

    // Обработчик получения контакта (номера телефона)
    bot.on('contact', async (ctx) => {
      const contact = ctx.message.contact;

      // Проверяем, что контакт принадлежит пользователю, который его отправил
      if (contact.user_id.toString() !== ctx.from.id.toString()) {
        return ctx.reply(
          'Пожалуйста, отправьте свой собственный номер телефона через кнопку.',
          Markup.keyboard([
            [Markup.button.contactRequest('📱 Поделиться номером телефона')],
          ]).resize()
        );
      }

      try {
        // Сохраняем данные пользователя
        await userController.createOrUpdateUser({
          telegramId: ctx.from.id.toString(),
          phoneNumber: contact.phone_number,
          username: ctx.from.username || null,
          fio: `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`,
        });

        // Показываем главное меню после сохранения номера
        const keyboard = await getMainMenuKeyboard(ctx.from.id, webAppUrl);
        return ctx.reply(
          'Спасибо! Ваш номер телефона сохранен. Теперь вы можете использовать все функции бота.',
          {
            ...keyboard,
            reply_markup: keyboard.reply_markup,
          }
        );
      } catch (error) {
        console.error('Ошибка при сохранении данных пользователя:', error);
        return ctx.reply(
          'Произошла ошибка при сохранении данных. Пожалуйста, попробуйте позже.',
          Markup.removeKeyboard()
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

    // Обработчик кнопки 'Мои заказы'
    bot.action('my_orders', async (ctx) => {
      await ctx.answerCbQuery(); // Отвечаем на callback, чтобы убрать 'loading'
      const userId = ctx.from.id.toString();
      const keyboard = await getMainMenuKeyboard(userId, webAppUrl);

      try {
        const orders = await orderController.getUserOrders(userId);

        if (!orders || orders.length === 0) {
          return ctx.editMessageText('У вас пока нет заказов.', keyboard);
        }

        let response = '<b>Ваши заказы:</b>\n\n';
        orders.forEach((order) => {
          const date = new Date(order.createdAt).toLocaleDateString('ru-RU');
          const statusText = getStatusText(order.status);
          response += `<b>Заказ #${order.id}</b> от ${date}\n`;
          response += `Статус: ${statusText}\n`;
          response += `Сумма: ${order.total.toLocaleString('ru-RU')} ₽\n\n`;
        });

        return ctx.editMessageText(response, {
          parse_mode: 'HTML',
          ...keyboard,
        });
      } catch (error) {
        console.error('Ошибка при получении заказов:', error);
        return ctx.editMessageText(
          'Произошла ошибка при получении ваших заказов. Попробуйте позже.',
          keyboard
        );
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

    // --- Обработка данных из Web App ---
    bot.on('web_app_data', async (ctx) => {
      console.log('[DEBUG] Получены данные из WebApp:', ctx.webAppData.data);
      try {
        const data = JSON.parse(ctx.webAppData.data);
        console.log('[DEBUG] Данные после JSON.parse:', data);

        // Проверяем наличие необходимых данных
        if (data.cart && Array.isArray(data.cart) && data.total !== undefined) {
          console.log('[DEBUG] Данные валидны, создаем заказ...');

          // Получаем данные пользователя
          const userId = ctx.from.id.toString();
          const user = await userController.getUserByTelegramId(userId);

          // Формируем данные для создания заказа в БД
          const orderData = {
            userId: userId,
            userName:
              `${ctx.from.first_name || ''} ${
                ctx.from.last_name || ''
              }`.trim() || 'Пользователь Telegram',
            total: data.total,
            // Связываем заказ с пользователем, если он есть в базе
            user: user ? { connect: { id: user.id } } : undefined,
            // Передаем cart как items, убедившись, что формат соответствует ожиданиям контроллера
            items: data.cart.map((item) => ({
              productId: item.productId,
              price: item.price,
              quantity: item.quantity,
            })),
            // Можно добавить контактные данные из формы, если она будет
            // contactInfo: data.contactInfo || {}
          };

          console.log(
            '[DEBUG] Данные для orderController.createOrder:',
            orderData
          );

          const order = await orderController.createOrder(orderData);
          console.log('[DEBUG] Заказ успешно создан в БД:', order);

          // Отправляем подтверждение пользователю
          const confirmationMessage =
            `🎉 <b>Заказ #${order.id} успешно оформлен!</b>\n\n` +
            `Сумма: ${order.total.toLocaleString('ru-RU')} ₽\n\n` +
            `Наш менеджер скоро свяжется с вами для подтверждения.`;

          // Получаем актуальную клавиатуру
          const keyboard = await getMainMenuKeyboard(ctx.from.id);
          await ctx.reply(confirmationMessage, {
            ...keyboard,
            parse_mode: 'HTML',
          });

        } else {
          console.warn('[DEBUG] Получены невалидные данные из WebApp:', data);
          await ctx.reply(
            'Произошла ошибка при обработке данных корзины. Пожалуйста, попробуйте еще раз.'
          );
        }
      } catch (error) {
        console.error('[CRITICAL] Ошибка при обработке web_app_data:', error);
        // Уведомляем пользователя об ошибке
        try {
          await ctx.reply(
            'Произошла критическая ошибка при оформлении заказа. Мы уже работаем над этим. Попробуйте позже.'
          );
        } catch (replyError) {
          console.error(
            '[CRITICAL] Не удалось отправить сообщение об ошибке пользователю:',
            replyError
          );
        }
      }
    });

    // --- Админские команды и действия ---

    // Вход в админ панель (/admin или кнопка)
    const showAdminPanel = async (ctx) => {
      return ctx.reply('<b>Панель администратора:</b>', {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('🗂️ Категории', 'admin_categories')],
          [Markup.button.callback('🖥️ Товары', 'admin_products')],
          [Markup.button.callback('📦 Заказы', 'admin_orders')],
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

    // --- Управление Категориями ---
    bot.action('admin_categories', checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const categories = await categoryController.getAllCategories();
      let message = '<b>Управление категориями:</b>\n\n';
      if (categories.length === 0) {
        message += 'Категории отсутствуют.';
      } else {
        categories.forEach((cat) => {
          message += `• ${cat.name} (ID: ${cat.id})\n`;
        });
      }
      await ctx.editMessageText(message, {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('➕ Добавить', 'add_category')],
          // Добавить кнопки Редактировать/Удалить, если нужно
          [Markup.button.callback('🔙 Назад', 'admin_panel')],
        ]).reply_markup,
      });
    });

    bot.action('add_category', checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      setState(ctx.from.id, 'wait_category_name');
      await ctx.reply('Введите название новой категории:');
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

    // Действие при выборе категории для просмотра товаров
    bot.action(/^products_cat_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const catId = parseInt(ctx.match[1]);
      try {
        const products = await productController.getProductsByCategory(catId);
        const category = await categoryController.getCategoryById(catId);
        let message = `<b>Товары в категории "${category.name}":</b>\n\n`;
        if (products.length === 0) {
          message += 'Товары отсутствуют.';
        } else {
          products.forEach((p) => {
            message += `• ${p.name} - ${p.price.toLocaleString(
              'ru-RU'
            )} ₽ (ID: ${p.id})\n`;
          });
        }
        await ctx.editMessageText(message, {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.button.callback(
                '➕ Добавить сюда',
                `add_product_to_${catId}`
              ),
            ],
            // Добавить кнопки Редактировать/Удалить товар
            [Markup.button.callback('🔙 К категориям', 'admin_products')],
          ]).reply_markup,
        });
      } catch (error) {
        console.error(
          `Ошибка при получении товаров категории ${catId}:`,
          error
        );
        await ctx.editMessageText('Произошла ошибка при получении товаров.');
      }
    });

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
        `🆔 Введите ID нового товара для категории ID ${catId}:\n\nВажно: ID должен быть уникальным числом!\n\n💡 Для отмены создания товара введите /cancel`
      );
    });

    // --- Управление Заказами ---
    bot.action('admin_orders', checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      try {
        const orders = await orderController.getAllOrders(); // Получаем все заказы
        let message = '<b>Управление заказами:</b>\n\n';
        if (orders.length === 0) {
          message += 'Заказы отсутствуют.';
          await ctx.editMessageText(message, {
            parse_mode: 'HTML',
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('🔙 Назад', 'admin_panel')],
            ]).reply_markup,
          });
          return;
        }

        // Показываем последние 10 (или меньше)
        const recentOrders = orders.slice(-10).reverse(); // Последние и переворачиваем (новые сверху)
        message += 'Последние заказы:\n';
        const buttons = recentOrders.map((order) => {
          const date = new Date(order.createdAt).toLocaleDateString('ru-RU');
          const statusText = getStatusText(order.status).replace(
            /<[^>]*>/g,
            ''
          ); // Убираем HTML для кнопки
          return [
            Markup.button.callback(
              `#${order.id} (${date}) - ${statusText}`,
              `order_${order.id}`
            ),
          ];
        });

        buttons.push([Markup.button.callback('🔙 Назад', 'admin_panel')]);

        await ctx.editMessageText(message, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: buttons },
        });
      } catch (error) {
        console.error('Ошибка при получении заказов для админа:', error);
        await ctx.editMessageText('Произошла ошибка при получении заказов.');
      }
    });

    // Просмотр деталей заказа админом
    bot.action(/^order_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const orderId = parseInt(ctx.match[1]);
      try {
        const order = await orderController.getOrderById(orderId);
        if (!order) {
          return ctx.editMessageText('Заказ не найден.', {
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('К списку заказов', 'admin_orders')],
            ]).reply_markup,
          });
        }

        let message = `<b>Детали заказа #${order.id}</b>\n\n`;
        message += `Дата: ${new Date(order.createdAt).toLocaleString(
          'ru-RU'
        )}\n`;
        message += `Пользователь: ${order.userName || 'Не указан'} (ID: ${
          order.userId
        })\n`;
        message += `Статус: ${getStatusText(order.status)}\n`;
        message += `Сумма: ${order.total.toLocaleString('ru-RU')} ₽\n\n`;

        // Контактная информация (если есть)
        if (
          order.contactName ||
          order.contactPhone ||
          order.contactEmail ||
          order.deliveryAddress
        ) {
          message += `<b>Контактные данные:</b>\n`;
          if (order.contactName) message += `Имя: ${order.contactName}\n`;
          if (order.contactPhone) message += `Телефон: ${order.contactPhone}\n`;
          if (order.contactEmail) message += `Email: ${order.contactEmail}\n`;
          if (order.deliveryAddress)
            message += `Адрес: ${order.deliveryAddress}\n`;
          if (order.comments) message += `Комментарий: ${order.comments}\n`;
          message += `\n`;
        }

        message += `<b>Товары:</b>\n`;
        if (order.items && order.items.length > 0) {
          order.items.forEach((item, index) => {
            message += `${index + 1}. ${
              item.product?.name || `Товар ID ${item.productId}`
            } x ${item.quantity} = ${(
              item.price * item.quantity
            ).toLocaleString('ru-RU')} ₽\n`;
          });
        } else {
          message += 'Товары не найдены в заказе.\n';
        }

        // Кнопки для смены статуса
        const statusButtons = [
          Markup.button.callback('🆕 Новый', `order_status_${orderId}_new`),
          Markup.button.callback(
            '⏳ Обработка',
            `order_status_${orderId}_processing`
          ),
          Markup.button.callback(
            '✅ Выполнен',
            `order_status_${orderId}_completed`
          ),
          Markup.button.callback(
            '❌ Отменен',
            `order_status_${orderId}_cancelled`
          ),
          // Добавить другие статусы при необходимости
        ];
        // Разбиваем кнопки статусов
        const statusKeyboard = [];
        for (let i = 0; i < statusButtons.length; i += 2) {
          statusKeyboard.push(statusButtons.slice(i, i + 2));
        }
        statusKeyboard.push([
          Markup.button.callback('🔙 К списку заказов', 'admin_orders'),
        ]);

        await ctx.editMessageText(message, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: statusKeyboard },
        });
      } catch (error) {
        console.error(`Ошибка при получении деталей заказа ${orderId}:`, error);
        await ctx.editMessageText(
          'Произошла ошибка при получении деталей заказа.'
        );
      }
    });

    // Изменение статуса заказа админом
    bot.action(/^order_status_(\d+)_([a-zA-Z]+)$/, checkAdmin, async (ctx) => {
      const orderId = parseInt(ctx.match[1]);
      const newStatus = ctx.match[2];

      try {
        await orderController.updateOrderStatus(orderId, newStatus);
        await ctx.answerCbQuery(
          `Статус заказа #${orderId} изменен на ${getStatusText(
            newStatus
          ).replace(/<[^>]*>/g, '')}`
        );
        // Обновляем сообщение с деталями заказа
        await bot.actions[`order_${orderId}`](ctx); // Вызываем обработчик деталей заказа заново
      } catch (error) {
        console.error(`Ошибка при изменении статуса заказа ${orderId}:`, error);
        await ctx.answerCbQuery('Ошибка при изменении статуса!');
        // Можно вернуть пользователя к деталям заказа
        // await bot.actions[`order_${orderId}`](ctx);
      }
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
          await bot.actions.admin_categories(ctx);
        } catch (error) {
          console.error('Ошибка при создании категории:', error);
          await ctx.reply(
            'Произошла ошибка при создании категории. Возможно, имя уже занято.'
          );
          // Оставляем состояние, чтобы пользователь мог попробовать снова
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
              await bot.actions[`products_cat_${parseInt(catId)}`](ctx);
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
    });

    // Временное хранилище для медиа-групп (альбомов)
    const mediaGroupBuffer = new Map();
    
    // Функция обработки фото из медиа-группы
    async function handleMediaGroupPhoto(ctx, userId, state, fileId, mediaGroupId) {
      // Только для дополнительных изображений поддерживаем альбомы
      if (!state.startsWith('wait_product_all_images_')) {
        // Для основного и FPS изображения - одиночные фото
        return await handleSinglePhoto(ctx, userId, state, fileId);
      }
      
      // Инициализируем буфер для этой медиа-группы
      if (!mediaGroupBuffer.has(mediaGroupId)) {
        mediaGroupBuffer.set(mediaGroupId, {
          userId,
          state,
          fileIds: [],
          timeout: null,
          ctx
        });
      }
      
      const groupData = mediaGroupBuffer.get(mediaGroupId);
      groupData.fileIds.push(fileId);
      
      // Очищаем предыдущий таймаут
      if (groupData.timeout) {
        clearTimeout(groupData.timeout);
      }
      
      // Устанавливаем новый таймаут на обработку (2 секунды после последнего фото)
      groupData.timeout = setTimeout(async () => {
        await processMediaGroup(mediaGroupId, groupData);
        mediaGroupBuffer.delete(mediaGroupId);
      }, 2000);
    }
    
    // Функция обработки завершенной медиа-группы
    async function processMediaGroup(mediaGroupId, groupData) {
      const { userId, state, fileIds, ctx } = groupData;
      
      if (!state.startsWith('wait_product_all_images_')) {
        return;
      }
      
      const stateParts = state.replace('wait_product_all_images_', '').split('|||');
      const [catId, productId, productName, priceStr, description, specs, image, fpsImage] = stateParts.slice(0, 8);
      const existingImages = stateParts.slice(8) || [];
      
      // Добавляем все новые file_id к существующим
      const updatedImages = [...existingImages, ...fileIds];
      const newState = `wait_product_all_images_${catId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${image}|||${fpsImage}|||${updatedImages.join('|||')}`;
      
      setState(userId, newState);
      
      // Отправляем подтверждение
      await ctx.reply(
        `✅ Получено ${fileIds.length} дополнительных изображений из альбома!\n\nВсего дополнительных изображений: ${updatedImages.length}\n\nОтправьте еще изображения или напишите "готово" для завершения:\n\n💡 Для отмены введите /cancel`
      );
    }
    
    // Функция обработки одиночного фото
    async function handleSinglePhoto(ctx, userId, state, fileId) {
      // Шаг 6: Основное изображение
      if (state.startsWith('wait_product_image_')) {
        const [catId, productId, productName, priceStr, description, specs] = state.replace('wait_product_image_', '').split('|||');
        
        setState(userId, `wait_product_fps_image_${catId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${fileId}`);
        return ctx.reply(
          '✅ Основное изображение получено!\n\n🎮 Отправьте изображение с FPS тестами:\n\n📸 Фото (со сжатием) или 📎 Файл (без сжатия)\n\nИли "-" для пропуска:\n\n💡 Для отмены введите /cancel'
        );
      }
      
      // Шаг 7: FPS изображение
      if (state.startsWith('wait_product_fps_image_')) {
        const [catId, productId, productName, priceStr, description, specs, image] = state.replace('wait_product_fps_image_', '').split('|||');
        
        setState(userId, `wait_product_all_images_${catId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${image}|||${fileId}`);
        return ctx.reply(
          '✅ FPS изображение получено!\n\n📸 Отправляйте дополнительные изображения товара:\n\n• 🖼️ По одному (фото или файлы)\n• 📚 Альбомом до 10 изображений сразу\n\nКогда закончите, напишите "готово" или "-" для пропуска:\n\n💡 Для отмены введите /cancel'
        );
      }
      
      // Шаг 8: Дополнительные изображения (одиночные)
      if (state.startsWith('wait_product_all_images_')) {
        const stateParts = state.replace('wait_product_all_images_', '').split('|||');
        const [catId, productId, productName, priceStr, description, specs, image, fpsImage] = stateParts.slice(0, 8);
        const existingImages = stateParts.slice(8) || [];
        
        // Добавляем новый file_id к существующим
        const updatedImages = [...existingImages, fileId];
        const newState = `wait_product_all_images_${catId}|||${productId}|||${productName}|||${priceStr}|||${description}|||${specs}|||${image}|||${fpsImage}|||${updatedImages.join('|||')}`;
        
        setState(userId, newState);
        return ctx.reply(
          `✅ Дополнительное изображение ${updatedImages.length} получено!\n\n📸 Отправьте еще изображения:\n• Одиночными или альбомом\n• Или напишите "готово" для завершения\n\n💡 Для отмены введите /cancel`
        );
      }
      
      // Если фото в неподходящем состоянии
      return ctx.reply(
        '❌ Изображение сейчас не ожидается. Используйте кнопки меню для навигации.\n\n💡 Для отмены текущего действия введите /cancel'
      );
    }
    
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

// --- Вспомогательная функция для статусов ---
function getStatusText(status) {
  const lowerStatus = status?.toLowerCase();
  switch (lowerStatus) {
    case 'new':
      return '🆕 Новый';
    case 'processing':
      return '⏳ Обрабатывается';
    case 'paid':
      return '💳 Оплачен'; // Добавим
    case 'confirmed':
      return '👍 Подтвержден';
    case 'shipped':
      return '🚚 Отправлен';
    case 'delivered':
      return '✅ Доставлен';
    case 'completed':
      return '🏁 Выполнен'; // Или '✅ Доставлен'
    case 'cancelled':
      return '❌ Отменен';
    default:
      return status || 'Неизвестен';
  }
}

// --- Экспорт ---
module.exports = {
  initBot, // Экспортируем функцию инициализации
  // Не экспортируем сам 'bot', чтобы избежать случайного использования до инициализации
  // Если нужен доступ к bot.telegram для отправки сообщений из других модулей,
  // можно сделать функцию-обертку или передавать его после инициализации.
};
