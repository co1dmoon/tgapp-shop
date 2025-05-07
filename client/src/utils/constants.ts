// API URL
export const API_URL = 'http://localhost:3001/api';

// Настройки для localStorage
export const LOCAL_STORAGE_KEYS = {
  VIEW_MODE: 'viewMode',
  LAST_CATEGORY: 'lastCategory',
  LAST_SEARCH: 'lastSearch',
  CURRENT_SECTION: 'currentSection',
};

// Цвета темы
export const THEME_COLORS = {
  PRIMARY: '#2196f3',
  SECONDARY: '#f44336',
  BACKGROUND: '#121212',
  SURFACE: '#1e1e1e',
  TEXT: '#ffffff',
  TEXT_SECONDARY: '#b0b0b0',
};

// Константы для фильтрации и сортировки
export const SORTING = {
  PRICE_ASC: { field: 'price', direction: 'asc' } as const,
  PRICE_DESC: { field: 'price', direction: 'desc' } as const,
  NAME_ASC: { field: 'name', direction: 'asc' } as const,
  NAME_DESC: { field: 'name', direction: 'desc' } as const,
};

// Константы для навигации
export const NAVIGATION = {
  SECTIONS: [
    {
      id: 'catalog',
      title: 'Каталог',
      icon: 'store',
    },
    {
      id: 'orders',
      title: 'Заказы',
      icon: 'shopping_bag',
    },
    {
      id: 'contact',
      title: 'Связь',
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