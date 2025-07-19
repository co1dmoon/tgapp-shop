const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const telegramBot = require('../../services/telegramBot');

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
