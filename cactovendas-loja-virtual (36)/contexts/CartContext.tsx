
import React, { createContext, ReactNode } from 'react';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  cartId: string | null; // UUID
  cartNumericId: number | null; // Integer ID
  isSyncing: boolean;
  initializeCartForStore: (slug: string) => void;
  addToCart: (item: Omit<CartItem, 'id' | 'quantidade'>, quantity: number, maxQuantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const cart = useCart();

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
};
