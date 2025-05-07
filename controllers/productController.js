const prisma = require('../models/prisma');

const getAllProducts = async () => {
  try {
    return await prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    throw error;
  }
};

const getProductsByCategory = async (categoryId) => {
  try {
    return await prisma.product.findMany({
      where: { categoryId: parseInt(categoryId) },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error(
      `Ошибка при получении товаров категории ${categoryId}:`,
      error
    );
    throw error;
  }
};

const getProductsByCategories = async (categories) => {
  try {
    return await prisma.product.findMany({
      where: { category: { name: { in: categories } } },
      include: { category: true },
    });
  } catch (error) {
    console.error(
      `Ошибка при получении товаров категорий ${categories.join(', ')}:`,
      error
    );
    throw error;
  }
  };

const getBestOffersProducts = async (categories) => {
  try {
    return await prisma.product.findMany({
      where: { favoriteRank: { gt: 0 }, category: { name: { in: categories } } },
      include: { category: true },
      orderBy: { favoriteRank: 'asc' },
      take: 10,
    });
  } catch (error) {
    console.error('Ошибка при получении лучших предложений:', error);
    throw error;
  }
};

const createProduct = async (data) => {
  if (typeof data.price === 'string') {
    data.price = parseFloat(data.price);
  }

  if (typeof data.categoryId === 'string') {
    data.categoryId = parseInt(data.categoryId);
  }

  try {
    return await prisma.product.create({ data });
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    throw error;
  }
};

const getProductById = async (id) => {
  try {
    return await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });
  } catch (error) {
    console.error(`Ошибка при получении товара с ID ${id}:`, error);
    throw error;
  }
};

const updateProduct = async (id, data) => {
  if (typeof data.price === 'string') {
    data.price = parseFloat(data.price);
  }

  if (typeof data.categoryId === 'string') {
    data.categoryId = parseInt(data.categoryId);
  }

  try {
    return await prisma.product.update({
      where: { id: parseInt(id) },
      data,
    });
  } catch (error) {
    console.error(`Ошибка при обновлении товара с ID ${id}:`, error);
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
    return await prisma.product.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    console.error(`Ошибка при удалении товара с ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductsByCategories,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getBestOffersProducts,
};
