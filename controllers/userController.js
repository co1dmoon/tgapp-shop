const prisma = require('../models/prisma');

const createOrUpdateUser = async (userData) => {
  try {
    const { telegramId, phoneNumber, username, firstName, lastName } = userData;

    const existingUser = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (existingUser) {
      return await prisma.user.update({
        where: { telegramId },
        data: {
          phoneNumber,
          username,
          firstName,
          lastName,
          updatedAt: new Date(),
        },
      });
    }

    return await prisma.user.create({
      data: {
        telegramId,
        phoneNumber,
        username,
        firstName,
        lastName,
      },
    });
  } catch (error) {
    console.error('Ошибка при создании/обновлении пользователя:', error);
    throw error;
  }
};

const getUserByTelegramId = async (telegramId) => {
  try {
    return await prisma.user.findUnique({
      where: { telegramId },
      include: {
        orders: true,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Ошибка при получении всех пользователей:', error);
    throw error;
  }
};

module.exports = {
  createOrUpdateUser,
  getUserByTelegramId,
  getAllUsers,
};
