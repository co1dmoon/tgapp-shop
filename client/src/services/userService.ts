import API from '../api/instance';
import type { User } from '../types';

/**
 * Сервис для работы с категориями
 */
export const userService = {
  /**
   * Получение пользователя по telegramId
   */
  getUserByTelegramId: async (telegramId: string): Promise<User> => {
    return API.get(`/user/${telegramId}`);
  },

};

export default userService; 