export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string | null;
  specs?: string | null;
  image?: string | null;
  inStock: boolean;
  categoryId: number;
  category?: Category;
}

export interface CartItem {
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

// Структура для отправки заказа на сервер
export interface OrderData {
  userId: string;
  userName?: string;
  cart: {
    productId: number;
    quantity: number;
    price: number;
  }[];
  total: number;
  contactInfo?: {
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    deliveryAddress?: string;
    comments?: string;
  };
}

// Структура заказа после получения с сервера
export interface Order {
  id?: number;
  userId: string;
  userName?: string | null;
  status?: string;
  total: number;
  items: CartItem[];
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  deliveryAddress?: string | null;
  comments?: string | null;
}

// Экспорт типов навигации
export type { AppSection, NavigationConfig, SectionState } from './navigation';
