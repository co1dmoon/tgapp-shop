import { useQuery } from '@tanstack/react-query';
import API from '../api/instance';

type Settings = Record<string, string | null>;

/**
 * Настройки сайта (контакты и т.п.). Редактируются админом из бота.
 * Сервер всегда отдаёт ВСЕ ключи (включая дефолтные значения для новых ключей).
 */
export function useSettings() {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => API.get('/settings'),
    staleTime: 1000 * 60 * 5,
  });
}
