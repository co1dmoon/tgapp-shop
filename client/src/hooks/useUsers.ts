import { useQuery } from '@tanstack/react-query';
import userService from '../services/userService';
import type { User } from '../types';

/**
 * Хук для получения пользователя по telegramId
 */
export function useUserByTelegramId({ telegramId }: { telegramId: string; }) {
  return useQuery<User>({
    queryKey: ['users', telegramId],
    queryFn: () => userService.getUserByTelegramId(telegramId),
  });
}
