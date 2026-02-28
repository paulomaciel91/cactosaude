
import { useState, useEffect, useCallback, useRef } from 'react';
import { CartItem } from '../types';
import api from '../services/supabaseService';

// Helper to compare attribute objects
const areAttributesEqual = (attr1: Record<string, string>, attr2: Record<string, string>) => {
  const keys1 = Object.keys(attr1 || {}).sort();
  const keys2 = Object.keys(attr2 || {}).sort();
  if (keys1.length !== keys2.length) return false;
  return keys1.every(key => attr1[key] === attr2[key]);
};

// Helper to create a consistent ID from attributes
const generateCartItemId = (productId: number, attributes: Record<string, string>) => {
  const attrString = Object.entries(attributes || {})
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
  return `${productId}-${attrString}`;
};

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null); // UUID
  const [cartNumericId, setCartNumericId] = useState<number | null>(null); // Integer ID
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const hasPendingWrite = useRef(false);
  const syncTimeoutRef = useRef<number | null>(null);

  // Effect to handle debounced writes to Supabase
  useEffect(() => {
    if (!hasPendingWrite.current || !storeSlug) {
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(async () => {
      hasPendingWrite.current = false;
      if (cartItems.length === 0 && !cartId) return;

      setIsSyncing(true);
      const total = cartItems.reduce((t, i) => t + i.preco_unitario * i.quantidade, 0);

      try {
        if (cartId) {
          await api.updateCart(storeSlug, cartId, cartItems, total);
        } else if (cartItems.length > 0) {
          const newCart = await api.createCart(storeSlug, cartItems, total);
          if (newCart?.carrinho_uuid) {
            const newCartId = newCart.carrinho_uuid;
            setCartId(newCartId);
            setCartNumericId(newCart.carrinho_id);
            localStorage.setItem(`cactoStoreCartId_${storeSlug}`, newCartId);
          }
        }
      } catch (error) {
        console.error("Failed to sync cart", error);
      } finally {
        setIsSyncing(false);
      }
    }, 1000);

    return () => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }
    };
  }, [cartItems, cartId, storeSlug]);

  const initializeCartForStore = useCallback(async (slug: string) => {
    if (isInitialized && slug === storeSlug) return;
    
    setIsInitialized(true);
    setStoreSlug(slug);
    
    const storedCartId = localStorage.getItem(`cactoStoreCartId_${slug}`);
    if (storedCartId) {
      setIsSyncing(true);
      const remoteCart = await api.getCart(slug, storedCartId);
      if (remoteCart) {
        setCartId(storedCartId);
        setCartItems(remoteCart.itens || []);
        setCartNumericId(remoteCart.carrinho_id);
      } else {
        localStorage.removeItem(`cactoStoreCartId_${slug}`);
        setCartId(null);
        setCartNumericId(null);
        setCartItems([]);
      }
      setIsSyncing(false);
    } else {
      setCartId(null);
      setCartNumericId(null);
      setCartItems([]);
    }
  }, [isInitialized, storeSlug]);
  
  const performCartUpdate = (updater: (prevItems: CartItem[]) => CartItem[]) => {
      hasPendingWrite.current = true;
      setCartItems(updater);
  };

  const addToCart = useCallback((item: Omit<CartItem, 'id' | 'quantidade'>, quantity: number, maxQuantity: number) => {
    performCartUpdate(prevItems => {
        const existingItemIndex = prevItems.findIndex(
            i => i.produto_id === item.produto_id && areAttributesEqual(i.atributos, item.atributos)
        );

        if (existingItemIndex > -1) {
            const newItems = [...prevItems];
            const currentItem = newItems[existingItemIndex];
            const newQuantity = currentItem.quantidade + quantity;
            currentItem.quantidade = Math.min(newQuantity, maxQuantity);
            return newItems;
        } else {
            const newItem: CartItem = {
            ...item,
            id: generateCartItemId(item.produto_id, item.atributos),
            quantidade: quantity
            };
            return [...prevItems, newItem];
        }
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    performCartUpdate(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    performCartUpdate(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== itemId);
      }
      return prevItems.map(item =>
        item.id === itemId ? { ...item, quantidade: quantity } : item
      );
    });
  }, []);
  
  const clearCart = useCallback(() => {
    performCartUpdate(() => []);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.preco_unitario * item.quantidade, 0);
  }, [cartItems]);
  
  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantidade, 0);
  }, [cartItems]);

  return { cartItems, cartId, cartNumericId, isSyncing, initializeCartForStore, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount };
};
