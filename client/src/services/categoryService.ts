import API from '../api/instance';
import type { Category } from '../types';

/**
 * Сервис для работы с категориями
 */
export const categoryService = {
  /**
   * Получение всех категорий
   */
  getAllCategories: async (): Promise<Category[]> => {
    return API.get('/categories');
  },

  /**
   * Получение категории по ID
   * @param id ID категории
   */
  getCategoryById: async (id: number): Promise<Category> => {
    return API.get(`/categories/${id}`);
  },


  getCategoryPrice: async (id: number): Promise<number> => {
    return API.get(`/categories/${id}/price`)
  }
};

export default categoryService; 