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
export function useProductsByCategory({ category, bestOffers }: { category: 'pc' | number | null, bestOffers: boolean; }) {
  return useQuery<Product[]>({
    queryKey: ['products', 'category', category, bestOffers],
    queryFn: () => {
      console.log(category, bestOffers);
      if (bestOffers) {
        const categories = category === 'pc' ? ['Full HD', '4K', '2K'] : ['игровые мыши', 'клавиатуры', 'наушники', 'мониторы'];
        return productService.getBestOffersProducts(categories);
      }
      if (category === 'pc') {
        return productService.getProductsByCategories(['Full HD', '4K', '2K']);
      }
      if (category === null) {
        return productService.getAllProducts();
      }

      return productService.getProductsByCategory(category);
    },
    // categoryId !== 'pc'
    //   ? categoryId ? productService.getProductsByCategory(categoryId) : productService.getAllProducts()
    //   : productService.getProductsByCategories(['Full HD', '4K', '2K']),
    enabled: category !== undefined, // Запрос выполнится если categoryId определён
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