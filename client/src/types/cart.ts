import type { Category } from './index';

export type CartItem = {
  productId: number;
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