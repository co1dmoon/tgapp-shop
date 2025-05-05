const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const telegramBot = require('../../services/telegramBot');
const AmoCRMClient = require('../../services/amoCRMClient');

// Инициализация AmoCRM клиента
const amoClient = new AmoCRMClient(
  process.env.AMO_CLIENT_ID,
  process.env.AMO_CLIENT_SECRET,
  process.env.AMO_REDIRECT_URI
);
amoClient.baseUrl = `https://${process.env.AMO_DOMAIN}`;
if (process.env.AMO_ACCESS_TOKEN) {
  amoClient.accessToken = process.env.AMO_ACCESS_TOKEN;
  amoClient.refreshToken = process.env.AMO_REFRESH_TOKEN;
  amoClient.expiresAt = new Date(Date.now() + 86400000); // Устанавливаем примерно на 24 часа вперед
}

// Получение всех заказов
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создание нового заказа
router.post('/', async (req, res) => {
  try {
    const { userId, userName, cart, total } = req.body;

    // Валидация данных
    if (!userId || !cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Неверные данные заказа' });
    }

    // Создание заказа в базе данных
    const order = await prisma.order.create({
      data: {
        userId: userId,
        userName: userName || 'Неизвестный пользователь',
        totalAmount: total || 0,
        status: 'NEW',
        orderItems: {
          create: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Формируем сообщение для отправки пользователю
    const orderMessage = formatOrderMessage(order);

    // Отправляем сообщение через бота
    telegramBot.sendOrderConfirmation(userId, orderMessage, order.id);

    // Отправляем заказ в AmoCRM
    try {
      await sendOrderToAmoCRM(order, userId, userName);
    } catch (amoError) {
      console.error('Ошибка при отправке заказа в AmoCRM:', amoError);
      // Продолжаем выполнение, даже если AmoCRM не работает
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ error: 'Ошибка сервера при создании заказа' });
  }
});

// Функция для форматирования сообщения о заказе
function formatOrderMessage(order) {
  let message = `🎉 *Заказ #${order.id} успешно оформлен!*\n\n`;
  message += `📋 *Детали заказа:*\n`;

  // Добавляем список товаров
  order.orderItems.forEach((item, index) => {
    message += `${index + 1}. ${item.product.name} - ${item.quantity} шт. x ${
      item.price
    } ₽\n`;
  });

  message += `\n💰 *Итого:* ${order.totalAmount} ₽\n\n`;
  message += `Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа.\n`;
  message += `Благодарим за покупку! 🙏`;

  return message;
}

// Функция для отправки заказа в AmoCRM
async function sendOrderToAmoCRM(order, userId, userName) {
  try {
    // Создаем сделку в AmoCRM
    const deal = await amoClient.createDeal({
      name: `Заказ #${order.id} из Telegram`,
      price: order.totalAmount,
      pipeline_id: process.env.AMO_PIPELINE_ID,
      status_id: process.env.AMO_NEW_STATUS_ID,
    });

    // Находим или создаем контакт
    // Здесь мы используем только имя пользователя из Telegram
    // В реальном проекте нужно запросить телефон/email пользователя при оформлении
    let contact = await amoClient.createContact({
      name: userName || `Пользователь Telegram ${userId}`,
    });

    // Связываем контакт со сделкой
    await amoClient.linkContactToDeal(contact.id, deal.id);

    // Добавляем товары в заказ
    for (const item of order.orderItems) {
      await amoClient.addProductToDeal(deal.id, {
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
      });
    }

    console.log(
      `Заказ #${order.id} успешно отправлен в AmoCRM, создана сделка #${deal.id}`
    );
    return deal;
  } catch (error) {
    console.error(`Ошибка при отправке заказа #${order.id} в AmoCRM:`, error);
    throw error;
  }
}

// Получение заказа по ID
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json(order);
  } catch (error) {
    console.error('Ошибка при получении заказа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление статуса заказа
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = parseInt(req.params.id);

    if (!status) {
      return res.status(400).json({ error: 'Статус не указан' });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status,
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Ошибка при обновлении статуса заказа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
