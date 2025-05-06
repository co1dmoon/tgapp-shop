import { useState } from 'react';
import { useProduct } from './useProducts';
import { useUpdateEffect } from './useUpdateEffect';

/**
 * Хук для управления выбранным продуктом
 * Автоматически загружает данные о продукте при изменении ID
 */
export function useProductSelection() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Используем useProduct для загрузки данных о выбранном продукте
  const {
    data: selectedProduct,
    isLoading,
    error,
    refetch
  } = useProduct(selectedProductId || 0);

  // Перезагружаем данные при изменении ID
  useUpdateEffect(() => {
    if (selectedProductId) {
      refetch();
    }
  }, [selectedProductId]);

  // Функция для выбора продукта
  const selectProduct = (id: number | null) => {
    setSelectedProductId(id);
  };

  return {
    selectedProductId,
    selectedProduct,
    isLoading,
    error,
    selectProduct
  };
} 