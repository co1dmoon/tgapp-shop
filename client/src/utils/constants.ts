// API URL
export const API_URL = import.meta.env.VITE_API_URL;

// Константы для навигации
export const NAVIGATION = {
  SECTIONS: [
    {
      id: 'catalog',
      title: 'Каталог',
      icon: 'store',
    },
    {
      id: 'cart',
      title: 'Корзина',
      icon: 'shopping_cart',
    },
    {
      id: 'contact',
      title: 'Контакты',
      icon: 'support_agent',
    },
    {
      id: 'info',
      title: 'Инфо',
      icon: 'info',
    },
  ] as const,
  DEFAULT_SECTION: 'catalog' as const,
}; 