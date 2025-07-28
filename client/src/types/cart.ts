import type { Category } from './index';

export type CartItem = {
  productId: number; // Числовой ID для внутренних связей
  productStringId: string; // Строковый productId для отображения и API
  quantity: number;
  price: number;
  name: string;
  image?: string | null;
  specs?: string | null;
  categoryId: number;
  category?: Category;
};

export type CartState = {
  items: CartItem[];
  total: number;
}; 