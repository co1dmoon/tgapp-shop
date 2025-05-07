import API from '../api/instance';
import type { Product } from '../types';

/**
 * Сервис для работы с товарами
 */
export const productService = {
  /**
   * Получение всех товаров
   */
  getAllProducts: async (): Promise<Product[]> => {
    return API.get('/products');
  },

  /**
   * Получение товаров по категории
   * @param categoryId ID категории
   */
  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    return API.get('/products', { params: { categoryId } });
  },

  /**
   * Получение товара по ID
   * @param id ID товара
   */
  getProductById: async (id: number): Promise<Product> => {
    return API.get(`/products/${id}`);
  },

  /**
   * Получение товаров по нескольким категориям
   * @param categories Массив категорий
   */
  getProductsByCategories: async (categories: string[]): Promise<Product[]> => {
    return API.get('/products', { params: { categories } });
  },

  /**
   * Получение лучших предложений
   */
  getBestOffersProducts: async (categories: string[]): Promise<Product[]> => {
    return API.get('/products', { params: { bestOffers: true, categories } });
  }
};

export default productService; 