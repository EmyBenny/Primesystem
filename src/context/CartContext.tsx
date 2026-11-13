import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Order, OrderType, Product } from '../types';

interface CartContextValue {
  items: CartItem[];
  orderMode: OrderType;
  setOrderMode: (mode: OrderType) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  activeInvoice: Order | null;
  setActiveInvoice: (order: Order | null) => void;
  addItem: (product: Product, quantity?: number, mode?: OrderType, openDrawer?: boolean) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalUsd: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'psg_cart_items_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [orderMode, setOrderMode] = useState<OrderType>('order');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Order | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  }, [items]);

  const addItem = (
    product: Product,
    quantity = 1,
    mode: OrderType = 'order',
    openDrawer = true
  ) => {
    setOrderMode(mode);
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
    if (openDrawer) setDrawerOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalUsd = items.reduce(
    (sum, item) => sum + Number(item.product.priceUsd) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        orderMode,
        setOrderMode,
        drawerOpen,
        setDrawerOpen,
        activeInvoice,
        setActiveInvoice,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotalUsd,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
