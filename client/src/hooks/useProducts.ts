import { useQuery } from '@tanstack/react-query';
import { productService } from '../services';
import type { Product } from '../types';

/**
 * Хук для получения всех товаров
 */
export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => productService.getAllProducts(),
  });
}

/**
 * Хук для получения товаров по категории
 */
export function useProductsByCategory(categoryId: number | null) {
  return useQuery<Product[]>({
    queryKey: ['products', 'category', categoryId],
    queryFn: () =>
      categoryId
        ? productService.getProductsByCategory(categoryId)
        : productService.getAllProducts(),
    enabled: categoryId !== undefined, // Запрос выполнится если categoryId определён
  });
}

/**
 * Хук для получения товара по ID
 */
export function useProduct(id: number) {
  return useQuery<Product>({
    queryKey: ['products', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id, // Запрос будет выполнен только если id существует
  });
} 