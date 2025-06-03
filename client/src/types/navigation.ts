/**
 * Основные разделы приложения
 */
export type AppSection = 'catalog' | 'orders' | 'contact' | 'info' | 'cart';

/**
 * Дополнительные состояния раздела
 */
export type SectionState = {
  // Для каталога
  selectedCategory?: 'игровые пк' | 'девайсы' | null;
  selectedDeviceCategory?: number | null;
  selectedPcCategory?: number | null;
  selectedProductId?: number | null;

  // Для заказов
  selectedOrderId?: number | null;

  // Для корзины, контактов и инфо
  scrollPosition?: number;
};

/**
 * Конфигурация навигации
 */
export type NavigationConfig = {
  sections: Array<{
    id: AppSection;
    title: string;
    icon: string;
  }>;
}; 