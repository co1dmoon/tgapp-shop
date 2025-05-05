import API from '../api/instance';
import type { Order, OrderData } from '../types';

/**
 * Сервис для работы с заказами
 */
export const orderService = {
  /**
   * Создание нового заказа
   * @param orderData Данные заказа
   */
  createOrder: async (orderData: OrderData): Promise<Order> => {
    return API.post('/orders', orderData);
  },

  /**
   * Получение заказа по ID
   * @param id ID заказа
   */
  getOrderById: async (id: number): Promise<Order> => {
    return API.get(`/orders/${id}`);
  },

  /**
   * Получение заказов пользователя
   * @param userId ID пользователя
   */
  getUserOrders: async (userId: string): Promise<Order[]> => {
    return API.get(`/user/${userId}/orders`);
  }
};

export default orderService; 