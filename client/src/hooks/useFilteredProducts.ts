import { useMemo } from 'react';
import type { Product } from '../types';

/**
 * Хук для фильтрации товаров по категории
 */
export function useFilteredProducts(
  products: Product[] | undefined,
  categoryId: number | null
) {
  return useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    // Если категория не выбрана, возвращаем все товары
    if (categoryId === null) {
      return products;
    }

    // Фильтруем по категории
    return products.filter((product) => product.categoryId === categoryId);
  }, [products, categoryId]);
} 