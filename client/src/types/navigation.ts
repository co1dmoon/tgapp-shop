/**
 * Основные разделы приложения
 */
export type AppSection = 'catalog' | 'orders' | 'contact' | 'info';

/**
 * Дополнительные состояния раздела
 */
export type SectionState = {
  // Для каталога
  selectedCategoryId?: number | null;
  selectedProductId?: number | null;

  // Для заказов
  selectedOrderId?: number | null;

  // Для контактов и инфо
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