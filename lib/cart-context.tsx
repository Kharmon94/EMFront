'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  merch_item_id: number;
  variant_id?: number;
  quantity: number;
  artist_id: number;
  // Cached for display
  title?: string;
  price?: number;
  image?: string;
  artist_name?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (merch_item_id: number, variant_id?: number) => void;
  updateQuantity: (merch_item_id: number, quantity: number, variant_id?: number) => void;
  clearCart: () => void;
  itemCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'encrypted_media_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const addToCart = (item: CartItem) => {
    setCart(currentCart => {
      const existingIndex = currentCart.findIndex(
        i => i.merch_item_id === item.merch_item_id && i.variant_id === item.variant_id
      );

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const newCart = [...currentCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + item.quantity
        };
        return newCart;
      } else {
        // Add new item
        return [...currentCart, item];
      }
    });
  };

  const removeFromCart = (merch_item_id: number, variant_id?: number) => {
    setCart(currentCart =>
      currentCart.filter(
        item => !(item.merch_item_id === merch_item_id && item.variant_id === variant_id)
      )
    );
  };

  const updateQuantity = (merch_item_id: number, quantity: number, variant_id?: number) => {
    if (quantity <= 0) {
      removeFromCart(merch_item_id, variant_id);
      return;
    }

    setCart(currentCart =>
      currentCart.map(item =>
        item.merch_item_id === merch_item_id && item.variant_id === variant_id
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

