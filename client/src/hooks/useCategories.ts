import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services';
import type { Category } from '../types';

/**
 * Хук для получения всех категорий
 */
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });
}

/**
 * Хук для получения категории по ID
 */
export function useCategory(id: number) {
  return useQuery<Category>({
    queryKey: ['categories', id],
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id, // Запрос будет выполнен только если id существует
  });
} 