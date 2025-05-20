import { useCallback, useEffect, useState } from 'react';
import type { Product } from '../types';
import type { CartItem, CartState } from '../types/cart';
import { useTelegram } from './useTelegram';

const CART_STORAGE_KEY = 'tgapp-shop-cart';

const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const getInitialCartState = (): CartState => {
  if (isLocalStorageAvailable()) {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        return JSON.parse(savedCart);
      }
    } catch (error) {
      console.error('Ошибка при загрузке корзины:', error);
    }
  }
  return { items: [], total: 0 };
};

export function useCart() {
  const [cartState, setCartState] = useState<CartState>(getInitialCartState);
  const { webAppReady, sendData } = useTelegram();

  // Синхронизация с Telegram при изменении состояния
  useEffect(() => {
    if (webAppReady) {
      sendData({
        type: 'cart_update',
        cart: cartState
      });
    }
  }, [cartState, webAppReady, sendData]);

  // Сохранение в localStorage
  useEffect(() => {
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
      } catch (error) {
        console.error('Ошибка при сохранении корзины:', error);
      }
    }
  }, [cartState]);

  const addToCart = useCallback((product: Product) => {
    setCartState(prevState => {
      const existingItem = prevState.items.find(i => i.productId === product.id);
      
      if (existingItem) {
        const updatedItems = prevState.items.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
        return {
          items: updatedItems,
          total: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
        };
      }

      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image ?? undefined,
        specs: product.specs,
        quantity: 1,
        categoryId: product.categoryId,
        category: product.category
      };

      const updatedItems = [...prevState.items, newItem];
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
      };
    });
  }, []);

  const removeFromCart = useCallback((itemId: number) => {
    setCartState(prevState => {
      const updatedItems = prevState.items.filter(i => i.productId !== itemId);
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
      };
    });
  }, []);

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity < 1) return;

    setCartState(prevState => {
      const updatedItems = prevState.items.map(i =>
        i.productId === itemId ? { ...i, quantity } : i
      );
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartState({ items: [], total: 0 });
  }, []);

  return {
    cart: cartState,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
} 