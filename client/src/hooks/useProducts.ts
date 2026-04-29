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
export function useProductsByCategory({ category, bestOffers, enabled = true }: { category: 'pc' | number | null, bestOffers: boolean; enabled?: boolean; }) {
  return useQuery<Product[]>({
    queryKey: ['products', 'category', category, bestOffers],
    queryFn: async () => {
      // Добавляем искусственную задержку минимум 500мс
      const [data] = await Promise.all([
        (async () => {
          if (bestOffers) {

            return productService.getBestOffersProducts(category === 'pc' ? 'pc' : 'device');
          }
          if (category === 'pc') {
            return productService.getProductsByCategories(['full hd', '4k', '2k']);
          }
          if (category === null) {
            return productService.getAllProducts();
          }

          return productService.getProductsByCategory(category);
        })(),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);

      return data;
    },
    enabled: enabled && category !== undefined,
    staleTime: 30000, // Данные считаются свежими 30 секунд
    gcTime: 5 * 60 * 1000, // Кэш хранится 5 минут
  });
}

/**
 * Хук для получения товаров по нескольким категориям
 */
export function useProductsByCategories(categories: string[]) {
  return useQuery<Product[]>({
    queryKey: ['products', 'categories', categories],
    queryFn: () => productService.getProductsByCategories(categories),
    enabled: categories.length > 0, // Запрос выполнится если categories не пустой массив
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