const prisma = require('../models/prisma');

const getAllCategories = async () => {
  try {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    throw error;
  }
};

const createCategory = async (data) => {
  try {
    return await prisma.category.create({ data });
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    throw error;
  }
};

const getCategoryById = async (id) => {
  try {
    return await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { products: true },
    });
  } catch (error) {
    console.error(`Ошибка при получении категории с ID ${id}:`, error);
    throw error;
  }
};

const updateCategory = async (id, data) => {
  try {
    return await prisma.category.update({
      where: { id: parseInt(id) },
      data,
    });
  } catch (error) {
    console.error(`Ошибка при обновлении категории с ID ${id}:`, error);
    throw error;
  }
};

const deleteCategory = async (id) => {
  try {
    return await prisma.category.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    console.error(`Ошибка при удалении категории с ID ${id}:`, error);
    throw error;
  }
};

const getPriceCategory = async (id) => {
  try {
    const minPriceProduct = await prisma.product.findFirst({
      where: {
        categoryId: Number(id),
      },
      orderBy: {
        price: "asc",
      },
      take: 1,
    });
    return minPriceProduct.price;
  } catch (error) {
    console.error(`Ошибка получения цены категории с ID ${id}`, error);
    throw error;
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getPriceCategory,
};
