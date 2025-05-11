import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { useCart } from "../hooks/useCart";
import type { Product } from "../types";
import type { CartItem } from "../types/cart";

type CartContextType = {
  cart: {
    items: CartItem[];
    total: number;
  };
  addToCart: (product: Product) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart();

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }

  return context;
}
