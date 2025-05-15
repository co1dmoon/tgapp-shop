const prisma = require('../models/prisma');
const telegram = require('../services/telegramBot');

const createOrder = async (orderData) => {
  try {
    const {
      userId,
      userName,
      items,
      total,
      contactInfo = {},
      user,
    } = orderData;

    const orderCreateData = {
      userId,
      userName,
      total,
      contactName: contactInfo.name,
      contactPhone: contactInfo.phone,
      contactEmail: contactInfo.email,
      deliveryAddress: contactInfo.address,
      comments: contactInfo.comments,
      // Создаем элементы заказа
      items: {
        create: items.map((item) => ({
          quantity: item.quantity || 1,
          price: item.price,
          productId: item.productId,
        })),
      },
    };

    if (user) {
      orderCreateData.user = user;
    }

    const order = await prisma.order.create({
      data: orderCreateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true, // Включаем пользователя в результат
      },
    });

    if (userId && userId !== 'unknown_user') {
      try {
        const productsText = items
          .map(
            (item) =>
              `• ${item.productId} - ${item.quantity} шт. × ${item.price} ₽`
          )
          .join('\n');

        const message =
          `🎉 Ваш заказ #${order.id} успешно оформлен!\n\n` +
          `📋 Список товаров:\n${productsText}\n\n` +
          `💰 Итого: ${total} ₽\n\n` +
          `✅ Наш менеджер свяжется с вами в ближайшее время.`;

        await telegram.sendOrderConfirmation(userId, message, order.id);
        console.log(
          `[INFO] Отправлено подтверждение заказа пользователю ${userId}`
        );
      } catch (botError) {
        console.error(
          '[ERROR] Не удалось отправить сообщение через бота:',
          botError
        );
        // Продолжаем выполнение, так как это не критичная ошибка
      }
    }

    return order;
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    throw error;
  }
};

const getAllOrders = async () => {
  try {
    return await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    throw error;
  }
};

const getUserOrders = async (userId) => {
  try {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error(
      `Ошибка при получении заказов пользователя ${userId}:`,
      error
    );
    throw error;
  }
};

const getOrderById = async (id) => {
  try {
    return await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(`Ошибка при получении заказа с ID ${id}:`, error);
    throw error;
  }
};

const updateOrderStatus = async (id, status) => {
  try {
    return await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });
  } catch (error) {
    console.error(`Ошибка при обновлении статуса заказа с ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
};
