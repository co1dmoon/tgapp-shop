import { QueryClient } from '@tanstack/react-query';

// Создаем и настраиваем клиент для React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Настройки по умолчанию
      staleTime: 1000 * 60 * 5, // Данные считаются устаревшими через 5 минут
      gcTime: 1000 * 60 * 10, // Данные хранятся в кэше 10 минут
      refetchOnWindowFocus: false, // Не перезапрашивать при фокусе окна
      retry: 1, // Повторить запрос при ошибке 1 раз
    },
  },
});

export default queryClient; 