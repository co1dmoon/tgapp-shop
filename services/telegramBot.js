const { Telegraf, Markup, message } = require('telegraf');
require('dotenv').config(); // Убедимся, что dotenv загружен

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');

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

          // Опционально: Отправка заказа в AmoCRM (если настроено)
          // try {
          //     await createAmoOrder(order);
          // } catch (amoError) {
          //     console.error("[AMOCRM Error] Не удалось отправить заказ в AmoCRM:", amoError);
          // }
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

    // Шаг 1 добавления товара: запрос имени
    bot.action(/^add_product_to_(\d+)$/, checkAdmin, async (ctx) => {
      await ctx.answerCbQuery();
      const catId = parseInt(ctx.match[1]);
      setState(ctx.from.id, `wait_product_name_${catId}`);
      await ctx.reply(
        `Введите название нового товара для категории ID ${catId}:`
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

      // --- FSM для добавления товара ---
      // Шаг 1: Получаем имя товара
      if (state.startsWith('wait_product_name_')) {
        const catId = parseInt(state.replace('wait_product_name_', ''));
        if (text.length < 2 || text.length > 100) {
          return ctx.reply(
            'Название товара должно быть от 2 до 100 символов. Попробуйте еще раз:'
          );
        }
        // Сохраняем имя и переходим к запросу цены
        setState(userId, `wait_product_price_${catId}_${text}`);
        return ctx.reply(
          'Введите цену товара (только число, например: 99990):'
        );
      }

      // Шаг 2: Получаем цену товара
      if (state.startsWith('wait_product_price_')) {
        const parts = state.replace('wait_product_price_', '').split('_');
        const catId = parseInt(parts[0]);
        const productName = parts.slice(1).join('_'); // Восстанавливаем имя, если в нем были подчеркивания

        const priceText = text.replace(/\s/g, '').replace(',', '.');
        const price = parseFloat(priceText);

        if (isNaN(price) || price <= 0) {
          return ctx.reply(
            'Некорректная цена. Введите положительное число (например: 99990):'
          );
        }
        // Сохраняем цену и переходим к запросу характеристик
        setState(userId, `wait_product_specs_${catId}_${productName}_${price}`);
        return ctx.reply(
          'Введите краткие характеристики товара (например: CPU, GPU, RAM, SSD):'
        );
      }

      // Шаг 3: Получаем характеристики
      if (state.startsWith('wait_product_specs_')) {
        const parts = state.replace('wait_product_specs_', '').split('_');
        const catId = parseInt(parts[0]);
        const price = parseFloat(parts[parts.length - 1]);
        const productName = parts.slice(1, -1).join('_'); // Имя между ID категории и ценой
        const specs = text;
        if (specs.length < 5 || specs.length > 255) {
          return ctx.reply(
            'Характеристики должны быть от 5 до 255 символов. Попробуйте еще раз:'
          );
        }
        // Сохраняем характеристики и переходим к запросу описания
        setState(
          userId,
          `wait_product_description_${catId}_${productName}_${price}_${specs}`
        );
        return ctx.reply('Введите полное описание товара (или "-", если нет):');
      }

      // Шаг 4: Получаем описание
      if (state.startsWith('wait_product_description_')) {
        const parts = state.replace('wait_product_description_', '').split('_');
        const catId = parseInt(parts[0]);
        const price = parseFloat(parts[parts.length - 2]);
        const specs = parts[parts.length - 1];
        const productName = parts.slice(1, -2).join('_');
        const description = text === '-' ? null : text;
        // Переходим к запросу URL изображения
        setState(
          userId,
          `wait_product_image_${catId}_${productName}_${price}_${specs}_${description}`
        );
        return ctx.reply(
          'Отправьте URL изображения товара (или "-", если нет):'
        );
      }

      // Шаг 5: Получаем URL изображения и создаем товар
      if (state.startsWith('wait_product_image_')) {
        const parts = state.replace('wait_product_image_', '').split('_');
        const catId = parseInt(parts[0]);
        const description =
          parts[parts.length - 1] === 'null' ? null : parts[parts.length - 1];
        const specs = parts[parts.length - 2];
        const price = parseFloat(parts[parts.length - 3]);
        const productName = parts.slice(1, -3).join('_');
        const imageUrl = text === '-' ? null : text;

        // Проверка URL (очень базовая)
        if (imageUrl && !imageUrl.startsWith('http')) {
          return ctx.reply(
            'Некорректный URL изображения. Должен начинаться с http/https. Попробуйте снова или введите "-":'
          );
        }

        try {
          const productData = {
            name: productName,
            price: price,
            specs: specs,
            description: description,
            image: imageUrl,
            categoryId: catId,
          };
          const product = await productController.createProduct(productData);
          setState(userId, null); // Сбрасываем состояние
          await ctx.reply(
            `✅ Товар "${productName}" (ID: ${product.id}) успешно создан в категории ID ${catId}!`
          );
          // Возвращаемся к списку товаров этой категории
          await bot.actions[`products_cat_${catId}`](ctx);
        } catch (error) {
          console.error('Ошибка при создании товара:', error);
          await ctx.reply(
            'Произошла ошибка при создании товара. Пожалуйста, проверьте данные или попробуйте позже.'
          );
          setState(userId, null); // Сбрасываем состояние при ошибке
        }
        return; // Завершаем обработку
      }
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
