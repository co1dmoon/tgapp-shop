const prisma = require('../models/prisma');

const isAdmin = async (telegramId) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { telegramId },
    });

    return admin !== null;
  } catch (error) {
    console.error(
      `Ошибка при проверке прав администратора для ID ${telegramId}:`,
      error
    );
    return false;
  }
};

const addAdmin = async (telegramId, name = 'Admin') => {
  try {
    return await prisma.admin.create({
      data: {
        telegramId,
        name,
      },
    });
  } catch (error) {
    console.error(
      `Ошибка при добавлении администратора с ID ${telegramId}:`,
      error
    );
    throw error;
  }
};

const removeAdmin = async (telegramId) => {
  try {
    return await prisma.admin.delete({
      where: { telegramId },
    });
  } catch (error) {
    console.error(
      `Ошибка при удалении администратора с ID ${telegramId}:`,
      error
    );
    throw error;
  }
};

const getAllAdmins = async () => {
  try {
    return await prisma.admin.findMany();
  } catch (error) {
    console.error('Ошибка при получении списка администраторов:', error);
    throw error;
  }
};

const initAdminsFromEnv = async () => {
  try {
    const adminIds = process.env.ADMIN_IDS
      ? process.env.ADMIN_IDS.split(',')
      : [];

    for (const adminId of adminIds) {
      const exists = await isAdmin(adminId);

      if (!exists) {
        await addAdmin(adminId);
        console.log(
          `Администратор с ID ${adminId} добавлен из переменной окружения`
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Ошибка при инициализации администраторов:', error);
    return false;
  }
};

module.exports = {
  isAdmin,
  addAdmin,
  removeAdmin,
  getAllAdmins,
  initAdminsFromEnv,
};
