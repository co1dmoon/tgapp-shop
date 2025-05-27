const prisma = require('../models/prisma');
const telegram = require('../services/telegramBot');

const createOrder = async (orderData) => {
  try {
    const {
      userId,
      userModelId,
      userName,
      cart,
      total,
      contactName,
      contactPhone,
      contactEmail,
      deliveryAddress,
      deliveryType,
      payingType,
      comments,
      promocode,
    } = orderData;

    const orderCreateData = {
      userId,
      userName,
      userModelId,
      total,
      contactName,
      contactPhone,
      deliveryAddress,
      deliveryType,
      payingType,
      ...( contactEmail && { contactEmail }),
      ...(comments && { comments }),
      ...(promocode && { promocode }),
      items: {
        create: cart.map((item) => ({
          quantity: item.quantity || 1,
          price: item.price,
          productId: item.productId,
        })),
      },
    };

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
