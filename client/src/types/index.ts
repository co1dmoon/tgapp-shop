import type { CartItem } from './cart';

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
  price?: number | null;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string | null;
  specs?: string | null;
  image?: string | null;
  fpsImage?: string | null;
  allImages: string;
  inStock: boolean;
  favoriteRank?: number;
  categoryId: number;
  category?: Category;
}

export interface User {
  id: number;
  telegramId: string;
  phoneNumber: string;
  username?: string | null;
  fio?: string | null;
  orders?: Order[];
}


export enum DeliveryType {
  MOSCOW = "MOSCOW",
  PICKUP = "PICKUP",
  CDEK = "CDEK",
}

export enum PayingType {
  CASH = "CASH",
  CARD = "CARD",
  CREDIT = "CREDIT",
  OTHER = "OTHER",
}

// Структура для отправки заказа на сервер
export interface OrderData {
  userId: string | number;
  userName?: string;
  cart: CartItem[]
  total: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  deliveryAddress?: string;
  comments?: string;
  promocode?: string;
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
  deliveryType: DeliveryType;
  payingType: PayingType;
  promocode: string;
  deliveryAddress?: string | null;
  comments?: string | null;
}

// Экспорт типов навигации
export type { AppSection, NavigationConfig, SectionState } from './navigation';

